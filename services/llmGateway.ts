// services/llmGateway.ts
// Unified LLM Gateway with provider fallback, retry logic, and caching

import { ApiProvider } from "../types";
import { multiProviderAiService } from "./multiProviderAiService";
import { retryWithBackoff, isCircuitOpen } from "./retryService";
import { withCache, generateCacheKey, CacheTTL } from "./aiCacheService";
import { logEvent, logError } from "./loggingService";

// Types for the gateway
export interface GatewayRequest {
  taskType: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  signal?: AbortSignal;
  // Caching options
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
}

export interface GatewayResponse<T> {
  data: T;
  provider: string;
  model: string;
  cached: boolean;
  retryCount: number;
  latencyMs: number;
}

interface ProviderConfig {
  provider: ApiProvider;
  model: string;
}

/**
 * LLM Gateway - Unified interface for AI requests with:
 * - Automatic provider fallback
 * - Retry with exponential backoff
 * - Response caching
 * - Circuit breaker pattern
 * - Request deduplication
 */
export class LLMGateway {
  private providers: ProviderConfig[] = [];
  private defaultTTL = CacheTTL.GUIDANCE;

  /**
   * Configure the gateway with available providers in priority order
   */
  configure(providers: ProviderConfig[]): void {
    this.providers = providers;
    logEvent("LLM Gateway configured", {
      providers: providers.map((p) => `${p.provider.providerId}:${p.model}`),
    });
  }

  /**
   * Get the list of available providers (circuit not open)
   */
  getAvailableProviders(): ProviderConfig[] {
    return this.providers.filter((p) => !isCircuitOpen(p.provider.providerId));
  }

  /**
   * Execute a JSON request with fallback and caching
   */
  async executeJson<T>(
    request: GatewayRequest,
    schema: Record<string, unknown>,
    fallbackProviders?: ProviderConfig[]
  ): Promise<GatewayResponse<T>> {
    const providers = fallbackProviders || this.providers;
    const startTime = Date.now();
    let retryCount = 0;
    let lastError: Error | null = null;

    // Generate cache key
    const cacheKey = generateCacheKey({
      taskType: request.taskType,
      providerId: providers[0]?.provider.providerId || "unknown",
      model: providers[0]?.model || "unknown",
      prompt: request.prompt,
      systemInstruction: request.systemInstruction,
    });

    // Check cache first if enabled
    if (request.cache?.enabled !== false) {
      const ttl = request.cache?.ttl || this.getTTLForTask(request.taskType);

      try {
        const result = await withCache<T>(
          cacheKey,
          async () => {
            const response = await this.executeWithFallback<T>(
              providers,
              async (config) => {
                retryCount++;
                return multiProviderAiService.generateJson(
                  {
                    provider: config.provider,
                    model: config.model,
                    prompt: request.prompt,
                    systemInstruction: request.systemInstruction,
                    temperature: request.temperature,
                    signal: request.signal,
                  },
                  schema
                ) as Promise<T>;
              },
              request.signal
            );
            return response.data;
          },
          { ttl }
        );

        return {
          data: result,
          provider: providers[0]?.provider.providerId || "unknown",
          model: providers[0]?.model || "unknown",
          cached: retryCount === 0, // If no retries happened, it was cached
          retryCount: Math.max(0, retryCount - 1),
          latencyMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        throw lastError;
      }
    }

    // No caching - direct execution with fallback
    const response = await this.executeWithFallback<T>(
      providers,
      async (config) => {
        return multiProviderAiService.generateJson(
          {
            provider: config.provider,
            model: config.model,
            prompt: request.prompt,
            systemInstruction: request.systemInstruction,
            temperature: request.temperature,
            signal: request.signal,
          },
          schema
        ) as Promise<T>;
      },
      request.signal
    );

    return {
      ...response,
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Execute a streaming request with fallback (no caching for streams)
   */
  async executeStream(
    request: GatewayRequest & { onChunk: (chunk: string) => void },
    fallbackProviders?: ProviderConfig[]
  ): Promise<GatewayResponse<string>> {
    const providers = fallbackProviders || this.providers;
    const startTime = Date.now();

    const response = await this.executeWithFallback<string>(
      providers,
      async (config) => {
        return multiProviderAiService.generateStream({
          provider: config.provider,
          model: config.model,
          prompt: request.prompt,
          systemInstruction: request.systemInstruction,
          temperature: request.temperature,
          signal: request.signal,
          onChunk: request.onChunk,
        });
      },
      request.signal
    );

    return {
      ...response,
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Execute a grounding request (Google only, no fallback)
   */
  async executeWithGrounding(
    request: GatewayRequest,
    googleProvider: ProviderConfig
  ): Promise<GatewayResponse<{ text: string; sources: Array<{ uri: string; title: string }> }>> {
    const startTime = Date.now();

    const result = await retryWithBackoff(
      async () => {
        return multiProviderAiService.generateWithGrounding({
          provider: googleProvider.provider,
          model: googleProvider.model,
          prompt: request.prompt,
          systemInstruction: request.systemInstruction,
          temperature: request.temperature,
          signal: request.signal,
        });
      },
      googleProvider.provider.providerId,
      { signal: request.signal }
    );

    return {
      data: result,
      provider: googleProvider.provider.providerId,
      model: googleProvider.model,
      cached: false,
      retryCount: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Internal: Execute with provider fallback chain
   */
  private async executeWithFallback<T>(
    providers: ProviderConfig[],
    executor: (config: ProviderConfig) => Promise<T>,
    signal?: AbortSignal
  ): Promise<GatewayResponse<T>> {
    const availableProviders = providers.filter((p) => !isCircuitOpen(p.provider.providerId));

    if (availableProviders.length === 0) {
      throw new Error("All providers are unavailable (circuit breakers open)");
    }

    let lastError: Error | null = null;
    let totalRetries = 0;

    for (let i = 0; i < availableProviders.length; i++) {
      const config = availableProviders[i];

      // Check if aborted
      if (signal?.aborted) {
        throw new DOMException("Request aborted", "AbortError");
      }

      try {
        logEvent("Attempting provider", {
          provider: config.provider.providerId,
          model: config.model,
          attemptNumber: i + 1,
          totalProviders: availableProviders.length,
        });

        const result = await retryWithBackoff(() => executor(config), config.provider.providerId, {
          signal,
          maxRetries: 2, // 2 retries per provider before falling back
        });

        return {
          data: result,
          provider: config.provider.providerId,
          model: config.model,
          cached: false,
          retryCount: totalRetries,
          latencyMs: 0, // Will be set by caller
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't fall back on abort
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }

        totalRetries++;

        // Log the fallback
        if (i < availableProviders.length - 1) {
          logEvent("Provider failed, falling back", {
            failedProvider: config.provider.providerId,
            nextProvider: availableProviders[i + 1]?.provider.providerId,
            error: lastError.message,
          });
        }
      }
    }

    logError("All providers failed", {
      providers: availableProviders.map((p) => p.provider.providerId),
      lastError: lastError?.message,
    });

    throw lastError || new Error("All providers failed");
  }

  /**
   * Get TTL for a specific task type
   */
  private getTTLForTask(taskType: string): number {
    const ttlMap: Record<string, number> = {
      categorize: CacheTTL.CATEGORIZATION,
      draftReport: CacheTTL.REPORT_DRAFT,
      refineReport: CacheTTL.REPORT_DRAFT,
      getAppropriateness: CacheTTL.APPROPRIATENESS,
      getDetailedGuidance: CacheTTL.GUIDANCE,
      generateDifferentials: CacheTTL.DIFFERENTIALS,
      selectGuidelines: CacheTTL.GUIDELINES,
      rundownMostLikely: CacheTTL.RUNDOWN,
      rundownTopFacts: CacheTTL.RUNDOWN,
      rundownWhatToLookFor: CacheTTL.RUNDOWN,
      rundownPitfalls: CacheTTL.RUNDOWN,
      rundownSearchPattern: CacheTTL.RUNDOWN,
      rundownPertinentNegatives: CacheTTL.RUNDOWN,
      rundownClassicSigns: CacheTTL.RUNDOWN,
      rundownBottomLine: CacheTTL.RUNDOWN,
      rundownAppropriateness: CacheTTL.RUNDOWN,
    };

    return ttlMap[taskType] || this.defaultTTL;
  }
}

// Singleton instance
export const llmGateway = new LLMGateway();
