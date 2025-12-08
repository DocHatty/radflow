// services/providerValidationService.ts
// Auto-validation and setup service for API providers

import { ApiProvider, FetchedModel, ProviderId } from "../types";
import { fetchModels } from "./modelFetcherService";
import { logEvent, logError } from "./loggingService";

export interface ValidationResult {
  isValid: boolean;
  message: string;
  models?: FetchedModel[];
  latencyMs?: number;
  capabilities?: ProviderCapabilities;
}

export interface ProviderCapabilities {
  textGeneration: boolean;
  imageGeneration: boolean;
  grounding: boolean;
  streaming: boolean;
  jsonMode: boolean;
}

// Default capabilities by provider
const PROVIDER_CAPABILITIES: Record<ProviderId, ProviderCapabilities> = {
  google: {
    textGeneration: true,
    imageGeneration: true,
    grounding: true,
    streaming: true,
    jsonMode: true,
  },
  openai: {
    textGeneration: true,
    imageGeneration: true, // DALL-E
    grounding: false,
    streaming: true,
    jsonMode: true,
  },
  anthropic: {
    textGeneration: true,
    imageGeneration: false,
    grounding: false,
    streaming: true,
    jsonMode: true,
  },
  openrouter: {
    textGeneration: true,
    imageGeneration: false,
    grounding: false,
    streaming: true,
    jsonMode: true,
  },
  perplexity: {
    textGeneration: true,
    imageGeneration: false,
    grounding: true, // Built-in web search
    streaming: true,
    jsonMode: false,
  },
};

/**
 * Validate an API key by making a lightweight test request
 */
async function validateGoogleKey(provider: ApiProvider): Promise<ValidationResult> {
  const startTime = Date.now();
  try {
    const models = await fetchModels(provider);
    return {
      isValid: true,
      message: `Connected successfully. ${models.length} models available.`,
      models,
      latencyMs: Date.now() - startTime,
      capabilities: PROVIDER_CAPABILITIES.google,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      isValid: false,
      message: `Failed to connect: ${message}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function validateOpenAIKey(provider: ApiProvider): Promise<ValidationResult> {
  const startTime = Date.now();
  const baseUrl = provider.baseUrl || "https://api.openai.com/v1";

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } }).error?.message || response.statusText;
      return {
        isValid: false,
        message: `API Error: ${errorMessage}`,
        latencyMs: Date.now() - startTime,
      };
    }

    const models = await fetchModels(provider);
    return {
      isValid: true,
      message: `Connected successfully. ${models.length} GPT models available.`,
      models,
      latencyMs: Date.now() - startTime,
      capabilities: PROVIDER_CAPABILITIES.openai,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      isValid: false,
      message: `Connection failed: ${message}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function validateAnthropicKey(provider: ApiProvider): Promise<ValidationResult> {
  const startTime = Date.now();
  const baseUrl = provider.baseUrl || "https://api.anthropic.com/v1";

  try {
    // Anthropic doesn't have a /models endpoint, so we make a minimal completion request
    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": provider.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } }).error?.message || response.statusText;

      // Check for specific error types
      if (response.status === 401) {
        return {
          isValid: false,
          message: "Invalid API key",
          latencyMs: Date.now() - startTime,
        };
      }

      return {
        isValid: false,
        message: `API Error: ${errorMessage}`,
        latencyMs: Date.now() - startTime,
      };
    }

    const models = await fetchModels(provider);
    return {
      isValid: true,
      message: `Connected successfully. ${models.length} Claude models available.`,
      models,
      latencyMs: Date.now() - startTime,
      capabilities: PROVIDER_CAPABILITIES.anthropic,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      isValid: false,
      message: `Connection failed: ${message}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function validateOpenRouterKey(provider: ApiProvider): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    // OpenRouter has a /auth/key endpoint to validate keys
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        isValid: false,
        message: "Invalid API key",
        latencyMs: Date.now() - startTime,
      };
    }

    const keyData = await response.json();
    const models = await fetchModels(provider);

    return {
      isValid: true,
      message: `Connected successfully. Credits: $${(keyData as { data?: { limit_remaining?: number } }).data?.limit_remaining?.toFixed(2) || "N/A"}. ${models.length} models available.`,
      models,
      latencyMs: Date.now() - startTime,
      capabilities: PROVIDER_CAPABILITIES.openrouter,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      isValid: false,
      message: `Connection failed: ${message}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function validatePerplexityKey(provider: ApiProvider): Promise<ValidationResult> {
  const startTime = Date.now();
  const baseUrl = provider.baseUrl || "https://api.perplexity.ai";

  try {
    // Perplexity uses OpenAI-compatible API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } }).error?.message || response.statusText;
      return {
        isValid: false,
        message: `API Error: ${errorMessage}`,
        latencyMs: Date.now() - startTime,
      };
    }

    const models = await fetchModels(provider);
    return {
      isValid: true,
      message: `Connected successfully. ${models.length} Sonar models available.`,
      models,
      latencyMs: Date.now() - startTime,
      capabilities: PROVIDER_CAPABILITIES.perplexity,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      isValid: false,
      message: `Connection failed: ${message}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Validate a provider's API key and fetch available models
 */
export async function validateProvider(provider: ApiProvider): Promise<ValidationResult> {
  if (!provider.apiKey || provider.apiKey.trim() === "") {
    return {
      isValid: false,
      message: "No API key provided",
    };
  }

  logEvent("Validating provider", { providerId: provider.providerId, name: provider.name });

  try {
    let result: ValidationResult;

    switch (provider.providerId) {
      case "google":
        result = await validateGoogleKey(provider);
        break;
      case "openai":
        result = await validateOpenAIKey(provider);
        break;
      case "anthropic":
        result = await validateAnthropicKey(provider);
        break;
      case "openrouter":
        result = await validateOpenRouterKey(provider);
        break;
      case "perplexity":
        result = await validatePerplexityKey(provider);
        break;
      default:
        result = {
          isValid: false,
          message: `Unknown provider: ${provider.providerId}`,
        };
    }

    if (result.isValid) {
      logEvent("Provider validated successfully", {
        providerId: provider.providerId,
        modelCount: result.models?.length,
        latencyMs: result.latencyMs,
      });
    } else {
      logError("Provider validation failed", {
        providerId: provider.providerId,
        message: result.message,
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logError("Provider validation error", { providerId: provider.providerId, error: message });
    return {
      isValid: false,
      message: `Validation error: ${message}`,
    };
  }
}

// All AI task types that need model assignments
const ALL_AI_TASKS = [
  "categorize",
  "draftReport",
  "getGuidance",
  "refineReport",
  "integrateDictation",
  "finalReview",
  "applyRecommendations",
  "generateDifferentials",
  "synthesizeImpression",
  "answerQuery",
  "selectGuidelines",
  "generateImage",
  "getAppropriateness",
  "getDetailedGuidance",
  "refineDifferentials",
  "rundownAppropriateness",
  "rundownMostLikely",
  "rundownTopFacts",
  "rundownWhatToLookFor",
  "rundownPitfalls",
  "rundownSearchPattern",
  "rundownPertinentNegatives",
  "rundownClassicSigns",
  "rundownBottomLine",
];

/**
 * Get recommended model assignments for a provider based on task type
 */
export function getRecommendedModels(
  providerId: ProviderId,
  models: FetchedModel[]
): Record<string, string> {
  const recommendations: Record<string, string> = {};

  switch (providerId) {
    case "google": {
      // Find best Gemini models
      const flash =
        models.find((m) => m.id.includes("gemini-2") && m.id.includes("flash")) ||
        models.find((m) => m.id.includes("gemini") && m.id.includes("flash"));
      const pro = models.find((m) => m.id.includes("gemini") && m.id.includes("pro"));
      const imagen =
        models.find((m) => m.id.includes("imagen-4")) ||
        models.find((m) => m.id.includes("imagen"));

      const defaultModel = flash?.id || pro?.id || "gemini-2.0-flash-exp";

      // Assign flash for most tasks (fast + capable)
      ALL_AI_TASKS.forEach((task) => {
        recommendations[task] = defaultModel;
      });

      // Image generation needs Imagen
      if (imagen) {
        recommendations.generateImage = imagen.id;
      }

      break;
    }

    case "openai": {
      const gpt4 =
        models.find((m) => m.id.includes("gpt-4o")) || models.find((m) => m.id.includes("gpt-4"));
      const gpt35 = models.find((m) => m.id.includes("gpt-3.5"));

      const defaultModel = gpt4?.id || gpt35?.id || "gpt-4o";

      // All tasks use the best available model
      ALL_AI_TASKS.forEach((task) => {
        recommendations[task] = defaultModel;
      });

      break;
    }

    case "anthropic": {
      const sonnet = models.find((m) => m.id.includes("sonnet"));
      const haiku = models.find((m) => m.id.includes("haiku"));

      // Use sonnet for most tasks (best balance)
      const defaultModel = sonnet?.id || "claude-3-5-sonnet-20241022";

      ALL_AI_TASKS.forEach((task) => {
        recommendations[task] = defaultModel;
      });

      // Use haiku for simple/fast tasks
      if (haiku) {
        recommendations.categorize = haiku.id;
        recommendations.selectGuidelines = haiku.id;
      }

      break;
    }

    case "openrouter": {
      // For OpenRouter, prefer Claude or GPT-4o
      const claude =
        models.find(
          (m) => m.id.includes("claude-3.5-sonnet") || m.id.includes("claude-3-sonnet")
        ) || models.find((m) => m.id.includes("claude"));
      const gpt4 = models.find((m) => m.id.includes("gpt-4o"));
      const gemini = models.find((m) => m.id.includes("gemini"));

      const defaultModel = claude?.id || gpt4?.id || gemini?.id || "anthropic/claude-3.5-sonnet";

      ALL_AI_TASKS.forEach((task) => {
        recommendations[task] = defaultModel;
      });

      break;
    }

    case "perplexity": {
      const sonarLarge = models.find(
        (m) => m.id.includes("sonar-large") && m.id.includes("online")
      );
      const defaultModel = sonarLarge?.id || "llama-3.1-sonar-large-128k-online";

      ALL_AI_TASKS.forEach((task) => {
        recommendations[task] = defaultModel;
      });

      break;
    }
  }

  return recommendations;
}

/**
 * Get provider capabilities
 */
export function getProviderCapabilities(providerId: ProviderId): ProviderCapabilities {
  return (
    PROVIDER_CAPABILITIES[providerId] || {
      textGeneration: true,
      imageGeneration: false,
      grounding: false,
      streaming: true,
      jsonMode: false,
    }
  );
}
