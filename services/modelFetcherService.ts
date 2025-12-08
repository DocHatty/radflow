// services/modelFetcherService.ts
import { ApiProvider, FetchedModel } from "../types";
import { GoogleGenAI } from "@google/genai";

const ANTHROPIC_MODELS: FetchedModel[] = [
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
  { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
];

const PERPLEXITY_MODELS: FetchedModel[] = [
  { id: "llama-3.1-sonar-small-128k-online", name: "Llama 3.1 Sonar Small (128k, Online)" },
  { id: "llama-3.1-sonar-large-128k-online", name: "Llama 3.1 Sonar Large (128k, Online)" },
  { id: "llama-3.1-sonar-huge-128k-online", name: "Llama 3.1 Sonar Huge (128k, Online)" },
  { id: "llama-3.1-sonar-small-128k-chat", name: "Llama 3.1 Sonar Small (128k, Chat)" },
  { id: "llama-3.1-sonar-large-128k-chat", name: "Llama 3.1 Sonar Large (128k, Chat)" },
];

async function fetchGoogleModels(provider: ApiProvider): Promise<FetchedModel[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: provider.apiKey || process.env.API_KEY });
    const response = await ai.models.list();

    const models: FetchedModel[] = [];
    // Assuming the response is an async iterable Pager based on typical Google Node SDKs
    for await (const model of response) {
      models.push({
        id: model.name.replace("models/", ""),
        name: model.displayName || model.name,
      });
    }
    return models;
  } catch (e) {
    console.warn("Failed to fetch Google models via SDK, falling back to hardcoded list.", e);
    return [
      { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental)" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
      { id: "imagen-3.0-generate-001", name: "Imagen 3.0" },
      { id: "imagen-4.0-generate-001", name: "Imagen 4.0" },
    ];
  }
}

async function fetchOpenAIModels(provider: ApiProvider): Promise<FetchedModel[]> {
  const response = await fetch(`${provider.baseUrl || "https://api.openai.com/v1"}/models`, {
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return data.data
    .filter((model: any) => model.id.includes("gpt"))
    .map((model: any) => ({ id: model.id, name: model.id }))
    .sort((a: FetchedModel, b: FetchedModel) => a.name.localeCompare(b.name));
}

async function fetchOpenRouterModels(): Promise<FetchedModel[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models");
  if (!response.ok) {
    throw new Error("Failed to fetch models from OpenRouter");
  }
  const data = await response.json();
  return data.data
    .map((model: any) => ({ id: model.id, name: model.name || model.id }))
    .sort((a: FetchedModel, b: FetchedModel) => a.name.localeCompare(b.name));
}

export async function fetchModels(provider: ApiProvider): Promise<FetchedModel[]> {
  switch (provider.providerId) {
    case "google":
      return fetchGoogleModels(provider);
    case "openai":
      return fetchOpenAIModels(provider);
    case "anthropic":
      return Promise.resolve(ANTHROPIC_MODELS);
    case "openrouter":
      return fetchOpenRouterModels();
    case "perplexity":
      return Promise.resolve(PERPLEXITY_MODELS);
    default:
      throw new Error(`Fetching models for provider '${provider.providerId}' is not supported.`);
  }
}
