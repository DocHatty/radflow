// services/multiProviderAiService.ts
import { GoogleGenAI } from "@google/genai";
import { ApiProvider } from "../types";

interface AiRequestPayload {
  provider: ApiProvider;
  model: string;
  systemInstruction?: string;
  prompt: string;
  onChunk?: (chunk: string) => void;
  temperature?: number;
  signal?: AbortSignal; // Support for request cancellation
}

// --- Google GenAI Implementation ---
const runGoogleRequest = async (
  payload: AiRequestPayload,
  schema?: any,
  useGrounding: boolean = false,
) => {
  // For the default provider, apiKey might be empty, relying on the environment variable.
  // For user-added Google providers, we'd instantiate with their key.
  const ai = new GoogleGenAI({
    apiKey: payload.provider.apiKey || process.env.API_KEY,
  });
  const config: any = { systemInstruction: payload.systemInstruction };

  if (payload.temperature !== undefined) {
    config.temperature = payload.temperature;
  }
  if (schema) {
    config.responseMimeType = "application/json";
    config.responseSchema = schema;
  }
  if (useGrounding) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: payload.model,
    contents: payload.prompt,
    config,
  });

  if (useGrounding) {
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources =
      groundingMetadata?.groundingChunks
        ?.map((chunk) => chunk.web)
        .filter(
          (web): web is { uri: string; title: string } =>
            !!(web?.uri && web.title),
        ) || [];
    return { text, sources };
  }

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from AI model.");

  // This regex handles responses wrapped in ```json ... ``` and raw JSON objects.
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*$)/s);
  if (jsonMatch) {
    const jsonString = jsonMatch[1] || jsonMatch[2];
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      throw new Error(
        `Failed to parse extracted JSON from AI response. Content: ${jsonString}`,
      );
    }
  }

  // Fallback for cases where the text might be just the JSON string without fences
  try {
    return JSON.parse(text);
  } catch (e) {
    // If schema was expected but parsing failed, throw. Otherwise return text.
    if (schema)
      throw new Error(
        `AI returned non-JSON response for a JSON task. Content: ${text}`,
      );
    return text;
  }
};

const runGoogleStreamRequest = async (payload: AiRequestPayload) => {
  // Check if already aborted before starting
  if (payload.signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  const ai = new GoogleGenAI({
    apiKey: payload.provider.apiKey || process.env.API_KEY,
  });
  const config: any = { systemInstruction: payload.systemInstruction };
  if (payload.temperature !== undefined) {
    config.temperature = payload.temperature;
  }
  const stream = await ai.models.generateContentStream({
    model: payload.model,
    contents: payload.prompt,
    config,
  });

  let fullText = "";
  for await (const chunk of stream) {
    // Check for abort on each chunk
    if (payload.signal?.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }
    const text = chunk.text;
    fullText += text;
    payload.onChunk?.(text || "");
  }
  return fullText;
};

const runGoogleImageRequest = async (payload: AiRequestPayload) => {
  const ai = new GoogleGenAI({
    apiKey: payload.provider.apiKey || process.env.API_KEY,
  });

  // Using generateImages for Imagen models
  const response = await ai.models.generateImages({
    model: payload.model, // e.g., 'imagen-4.0-generate-001'
    prompt: payload.prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: "image/jpeg",
      aspectRatio: "16:9",
    },
  });

  const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64Image) {
    throw new Error("No image generated.");
  }
  return `data:image/jpeg;base64,${base64Image}`;
};

// --- Generic Fetch-based Implementation for OpenAI, Anthropic, OpenRouter ---
const runFetchStreamRequest = async (
  payload: AiRequestPayload,
): Promise<string> => {
  const { provider, model, systemInstruction, prompt, onChunk } = payload;
  let endpoint = provider.baseUrl || "";
  if (provider.providerId !== "anthropic") {
    endpoint += "/chat/completions";
  } else {
    endpoint += "/messages";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`,
  };

  let body: any;

  if (provider.providerId === "anthropic") {
    headers["anthropic-version"] = "2023-06-01";
    body = {
      model,
      system: systemInstruction,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      max_tokens: 4096,
    };
    if (payload.temperature !== undefined) {
      body.temperature = payload.temperature;
    }
  } else {
    // OpenAI and OpenRouter
    if (provider.providerId === "openrouter") {
      headers["HTTP-Referer"] = "https://localhost:3000"; // Example, required by OpenRouter
      headers["X-Title"] = "RadFlow";
    }
    body = {
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      stream: true,
    };
    if (payload.temperature !== undefined) {
      body.temperature = payload.temperature;
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: payload.signal, // Pass abort signal to fetch
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const rawChunk = decoder.decode(value);
    const lines = rawChunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.substring(6);
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          let textChunk = "";
          if (provider.providerId === "anthropic") {
            if (
              parsed.type === "content_block_delta" &&
              parsed.delta.type === "text_delta"
            ) {
              textChunk = parsed.delta.text;
            }
          } else {
            // OpenAI format
            textChunk = parsed.choices?.[0]?.delta?.content || "";
          }

          if (textChunk) {
            fullText += textChunk;
            onChunk?.(textChunk);
          }
        } catch (e) {
          console.error("Failed to parse stream chunk:", jsonStr);
        }
      }
    }
  }

  return fullText;
};

// --- Public Service Interface ---
export const multiProviderAiService = {
  async generateJson(payload: AiRequestPayload, schema: any) {
    if (payload.provider.providerId === "google") {
      return runGoogleRequest(payload, schema);
    } else {
      // Non-Google providers often don't support response schemas as robustly via API.
      // We can simulate it by adding instructions to the prompt.
      const promptWithSchema = `${payload.prompt}\n\nIMPORTANT: Your response MUST be a single, valid JSON object that conforms to the following schema. Do not include any other text, markdown, or explanations.\n\nSCHEMA:\n${JSON.stringify(schema, null, 2)}`;

      const streamPayload = {
        ...payload,
        prompt: promptWithSchema,
        onChunk: undefined,
      };
      const fullText = await runFetchStreamRequest(streamPayload);

      // Extract JSON from the response text
      const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
      if (!jsonMatch) {
        throw new Error("AI did not return a valid JSON object.");
      }
      const jsonString = jsonMatch[1] || jsonMatch[2];
      return JSON.parse(jsonString);
    }
  },

  async generateStream(payload: AiRequestPayload): Promise<string> {
    if (payload.provider.providerId === "google") {
      return runGoogleStreamRequest(payload);
    } else {
      return runFetchStreamRequest(payload);
    }
  },

  async generateWithGrounding(payload: AiRequestPayload) {
    if (payload.provider.providerId !== "google") {
      throw new Error("Grounding is only supported by Google providers.");
    }
    return runGoogleRequest(payload, undefined, true);
  },

  async generateImage(payload: AiRequestPayload): Promise<string> {
    if (payload.provider.providerId === "google") {
      return runGoogleImageRequest(payload);
    } else {
      throw new Error(
        "Image generation is currently only supported by Google Imagen models.",
      );
    }
  },
};
