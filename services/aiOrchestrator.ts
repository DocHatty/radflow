// services/aiOrchestrator.ts
import { useWorkflowStore } from "../App";
import { multiProviderAiService } from "./multiProviderAiService";
import { retryWithBackoff } from "./retryService";
import { withCache, generateCacheKey, CacheTTL } from "./aiCacheService";
import { logEvent, logError } from "./loggingService";
import { AiTaskType, PromptKey, ApiProvider } from "../types";
import {
  CATEGORIZATION_RESPONSE_SCHEMA,
  DIFFERENTIAL_DIAGNOSIS_SCHEMA,
  FINAL_REVIEW_SCHEMA,
  GUIDELINE_SELECTION_SCHEMA,
} from "../constants";

class AiTaskError extends Error {
  constructor(
    message: string,
    public context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "AiTaskError";
  }
}

type TaskConfig = {
  instructionKey?: PromptKey;
  requestType: "json" | "stream" | "grounding" | "image" | "normal";
  schema?: Record<string, unknown>;
  temperature?: number;
  cacheable?: boolean; // Whether this task can be cached
  cacheTTL?: number; // Custom TTL for this task
};

const TASK_CONFIGS: Record<AiTaskType, TaskConfig> = {
  categorize: {
    instructionKey: "CATEGORIZATION_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: CATEGORIZATION_RESPONSE_SCHEMA,
    cacheable: true,
    cacheTTL: CacheTTL.CATEGORIZATION,
  },
  draftReport: {
    instructionKey: "INITIAL_DRAFT_SYSTEM_INSTRUCTION",
    requestType: "stream",
    cacheable: false, // Streams are not cached
  },
  getGuidance: {
    instructionKey: "GUIDANCE_SYSTEM_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.GUIDANCE,
  },
  getAppropriateness: {
    instructionKey: "APPROPRIATENESS_SYSTEM_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.APPROPRIATENESS,
  },
  getDetailedGuidance: {
    instructionKey: "DETAILED_GUIDANCE_SYSTEM_INSTRUCTION",
    requestType: "stream",
    temperature: 0.4,
    cacheable: false,
  },
  refineReport: {
    instructionKey: "REFINE_SYSTEM_INSTRUCTION",
    requestType: "stream",
    cacheable: false,
  },
  integrateDictation: {
    instructionKey: "DICTATION_INTEGRATION_SYSTEM_INSTRUCTION",
    requestType: "stream",
    cacheable: false,
  },
  finalReview: {
    instructionKey: "FINAL_REVIEW_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: FINAL_REVIEW_SCHEMA,
    cacheable: true,
    cacheTTL: CacheTTL.GUIDANCE,
  },
  applyRecommendations: {
    instructionKey: "APPLY_RECOMMENDATION_SYSTEM_INSTRUCTION",
    requestType: "stream",
    cacheable: false,
  },
  generateDifferentials: {
    instructionKey: "DIFFERENTIAL_GENERATOR_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: DIFFERENTIAL_DIAGNOSIS_SCHEMA,
    cacheable: true,
    cacheTTL: CacheTTL.DIFFERENTIALS,
  },
  refineDifferentials: {
    instructionKey: "DIFFERENTIAL_REFINER_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: DIFFERENTIAL_DIAGNOSIS_SCHEMA,
    cacheable: false, // Refinement depends on user input
  },
  synthesizeImpression: {
    instructionKey: "IMPRESSION_SYNTHESIZER_SYSTEM_INSTRUCTION",
    requestType: "stream",
    cacheable: false,
  },
  answerQuery: {
    instructionKey: "QUERY_SYSTEM_INSTRUCTION",
    requestType: "stream",
    cacheable: false, // Q&A should always be fresh
  },
  selectGuidelines: {
    instructionKey: "GUIDELINE_SELECTION_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: GUIDELINE_SELECTION_SCHEMA,
    cacheable: true,
    cacheTTL: CacheTTL.GUIDELINES,
  },
  generateImage: {
    requestType: "image",
    cacheable: false,
  },
  rundownAppropriateness: {
    instructionKey: "RUNDOWN_APPROPRIATENESS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownMostLikely: {
    instructionKey: "RUNDOWN_MOST_LIKELY_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownTopFacts: {
    instructionKey: "RUNDOWN_TOP_FACTS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownWhatToLookFor: {
    instructionKey: "RUNDOWN_WHAT_TO_LOOK_FOR_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownPitfalls: {
    instructionKey: "RUNDOWN_PITFALLS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownSearchPattern: {
    instructionKey: "RUNDOWN_SEARCH_PATTERN_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownPertinentNegatives: {
    instructionKey: "RUNDOWN_PERTINENT_NEGATIVES_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownClassicSigns: {
    instructionKey: "RUNDOWN_CLASSIC_SIGNS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
  rundownBottomLine: {
    instructionKey: "RUNDOWN_BOTTOM_LINE_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
    cacheable: true,
    cacheTTL: CacheTTL.RUNDOWN,
  },
};

/**
 * Execute an AI task with retry logic, caching, and proper error handling
 */
export const runAiTask = async <T>(
  task: AiTaskType,
  payload: {
    prompt: string;
    onChunk?: (chunk: string) => void;
    signal?: AbortSignal;
  }
): Promise<T> => {
  const { settings } = useWorkflowStore.getState();
  const config = TASK_CONFIGS[task];

  if (!settings) {
    throw new AiTaskError("Settings are not loaded.", { task });
  }

  const activeProvider = settings.providers.find((p) => p.id === settings.activeProviderId);
  if (!activeProvider) {
    throw new AiTaskError("No active API provider selected.", { task });
  }

  const modelAssignments = settings.modelAssignments[activeProvider.id];
  const model = modelAssignments ? modelAssignments[task] : "";

  if (!model || !model.trim()) {
    throw new AiTaskError(
      `No model assigned for the task '${task}' with the provider '${activeProvider.name}'. Please check your settings.`,
      { task }
    );
  }

  logEvent(`AI Task Started: ${task}`, {
    provider: activeProvider.name,
    model,
  });

  // Check for abort before starting
  if (payload.signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  try {
    const systemInstruction = config.instructionKey ? settings.prompts[config.instructionKey] : "";

    const commonPayload = {
      provider: activeProvider,
      model,
      systemInstruction,
      prompt: payload.prompt,
      onChunk: payload.onChunk,
      temperature: config.temperature,
      signal: payload.signal,
    };

    // Generate cache key for cacheable tasks
    const cacheKey = config.cacheable
      ? generateCacheKey({
          taskType: task,
          providerId: activeProvider.providerId,
          model,
          prompt: payload.prompt,
          systemInstruction,
        })
      : "";

    let result: unknown;

    // Unified handler for appropriateness-related tasks
    if (task === "getGuidance" || task === "getAppropriateness") {
      result = await executeAppropriatenessTask(task, commonPayload, cacheKey, config);
    } else {
      result = await executeStandardTask(task, config, commonPayload, cacheKey);
    }

    logEvent(`AI Task Success: ${task}`);
    return result as T;
  } catch (error) {
    // Don't log abort errors as they're expected
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    logError(`Orchestrator (${task})`, {
      message,
      provider: activeProvider.name,
      model,
    });

    throw new AiTaskError(message, {
      task,
      provider: activeProvider.name,
      model,
    });
  }
};

// Common payload type for AI requests
interface CommonPayload {
  provider: ApiProvider;
  model: string;
  systemInstruction: string;
  prompt: string;
  onChunk?: (chunk: string) => void;
  temperature?: number;
  signal?: AbortSignal;
}

/**
 * Execute appropriateness task with grounding fallback
 */
async function executeAppropriatenessTask(
  task: AiTaskType,
  commonPayload: CommonPayload,
  cacheKey: string,
  config: TaskConfig
): Promise<{ text: string; sources: Array<{ uri: string; title: string }> }> {
  const taskLabel = task === "getGuidance" ? "guidance" : "appropriateness";
  const providerId = commonPayload.provider.providerId;

  // Try to get from cache first
  if (cacheKey) {
    const cached = await withCache<{
      text: string;
      sources: Array<{ uri: string; title: string }>;
    }>(
      cacheKey,
      async () => executeAppropriatenessWithRetry(taskLabel, commonPayload, providerId),
      { ttl: config.cacheTTL, skipCache: false }
    );
    return cached;
  }

  return executeAppropriatenessWithRetry(taskLabel, commonPayload, providerId);
}

/**
 * Execute appropriateness with retry logic
 */
async function executeAppropriatenessWithRetry(
  taskLabel: string,
  commonPayload: CommonPayload,
  providerId: string
): Promise<{ text: string; sources: Array<{ uri: string; title: string }> }> {
  if (providerId === "google") {
    logEvent(`Running ${taskLabel} task without grounding (temperature 0.3).`);

    // Use retry logic for the initial request
    const fullText = await retryWithBackoff(
      () => multiProviderAiService.generateStream(commonPayload),
      providerId,
      { signal: commonPayload.signal }
    );

    // Check if appropriateness is indeterminate and retry with grounding
    if (fullText.includes("[INDETERMINATE]")) {
      logEvent("Appropriateness indeterminate, retrying with grounding...");

      const groundingResult = await retryWithBackoff(
        () =>
          multiProviderAiService.generateWithGrounding({
            ...commonPayload,
            prompt: `${commonPayload.prompt}\n\nFOCUS: You previously could not determine appropriateness. Use Google Search to find the ACR Appropriateness Criteria and determine if this study is [CONSISTENT] or [INCONSISTENT]. Replace the [INDETERMINATE] tag with your determination.`,
          }),
        providerId,
        { signal: commonPayload.signal }
      );

      const groundedText = groundingResult.text;
      const appropriatenessMatch = groundedText.match(/\[(CONSISTENT|INCONSISTENT):[^\]]+\]/);

      if (appropriatenessMatch) {
        const updatedText = fullText.replace("[INDETERMINATE]", appropriatenessMatch[0]);
        return { text: updatedText, sources: groundingResult.sources };
      } else {
        return { text: fullText, sources: [] };
      }
    } else {
      return { text: fullText, sources: [] };
    }
  } else {
    logEvent(`Running ${taskLabel} task with LLM knowledge (no grounding).`);
    const fullText = await retryWithBackoff(
      () => multiProviderAiService.generateStream(commonPayload),
      providerId,
      { signal: commonPayload.signal }
    );
    return { text: fullText, sources: [] };
  }
}

/**
 * Execute standard task with retry and optional caching
 */
async function executeStandardTask(
  task: AiTaskType,
  config: TaskConfig,
  commonPayload: CommonPayload,
  cacheKey: string
): Promise<unknown> {
  const providerId = commonPayload.provider.providerId;

  // For cacheable tasks, wrap with cache
  if (config.cacheable && cacheKey && config.requestType !== "stream") {
    return withCache(cacheKey, () => executeWithRetry(task, config, commonPayload, providerId), {
      ttl: config.cacheTTL,
    });
  }

  // Non-cacheable or streaming tasks
  return executeWithRetry(task, config, commonPayload, providerId);
}

/**
 * Execute task with retry logic
 */
async function executeWithRetry(
  task: AiTaskType,
  config: TaskConfig,
  commonPayload: CommonPayload,
  providerId: string
): Promise<unknown> {
  switch (config.requestType) {
    case "json":
      return retryWithBackoff(
        () => multiProviderAiService.generateJson(commonPayload, config.schema),
        providerId,
        { signal: commonPayload.signal }
      );

    case "stream":
      // Streams can't be retried mid-stream, but we can retry the initial connection
      return retryWithBackoff(
        () => multiProviderAiService.generateStream(commonPayload),
        providerId,
        { signal: commonPayload.signal, maxRetries: 2 } // Fewer retries for streams
      );

    case "normal":
      return retryWithBackoff(
        () => multiProviderAiService.generateStream(commonPayload),
        providerId,
        { signal: commonPayload.signal }
      );

    case "image":
      return retryWithBackoff(
        () => multiProviderAiService.generateImage(commonPayload),
        providerId,
        { signal: commonPayload.signal }
      );

    default:
      throw new Error(`Unknown request type: ${config.requestType}`);
  }
}
