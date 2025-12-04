// services/aiOrchestrator.ts
import { useWorkflowStore } from "../App";
import { multiProviderAiService } from "./multiProviderAiService";
import { logEvent, logError } from "./loggingService";
import { AiTaskType, PromptKey } from "../types";
import {
  CATEGORIZATION_RESPONSE_SCHEMA,
  DIFFERENTIAL_DIAGNOSIS_SCHEMA,
  FINAL_REVIEW_SCHEMA,
  GUIDELINE_SELECTION_SCHEMA,
} from "../constants";

class AiTaskError extends Error {
  constructor(
    message: string,
    public context: Record<string, any> = {},
  ) {
    super(message);
    this.name = "AiTaskError";
  }
}

type TaskConfig = {
  instructionKey?: PromptKey; // Optional for tasks that don't use a system prompt (like image gen)
  requestType: "json" | "stream" | "grounding" | "image" | "normal";
  schema?: any;
  temperature?: number;
};

const TASK_CONFIGS: Record<AiTaskType, TaskConfig> = {
  categorize: {
    instructionKey: "CATEGORIZATION_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: CATEGORIZATION_RESPONSE_SCHEMA,
  },
  draftReport: {
    instructionKey: "INITIAL_DRAFT_SYSTEM_INSTRUCTION",
    requestType: "stream",
  },
  getGuidance: {
    instructionKey: "GUIDANCE_SYSTEM_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  getAppropriateness: {
    instructionKey: "APPROPRIATENESS_SYSTEM_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  getDetailedGuidance: {
    instructionKey: "DETAILED_GUIDANCE_SYSTEM_INSTRUCTION",
    requestType: "stream",
    temperature: 0.4,
  },
  refineReport: {
    instructionKey: "REFINE_SYSTEM_INSTRUCTION",
    requestType: "stream",
  },
  integrateDictation: {
    instructionKey: "DICTATION_INTEGRATION_SYSTEM_INSTRUCTION",
    requestType: "stream",
  },
  finalReview: {
    instructionKey: "FINAL_REVIEW_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: FINAL_REVIEW_SCHEMA,
  },
  applyRecommendations: {
    instructionKey: "APPLY_RECOMMENDATION_SYSTEM_INSTRUCTION",
    requestType: "stream",
  },
  generateDifferentials: {
    instructionKey: "DIFFERENTIAL_GENERATOR_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: DIFFERENTIAL_DIAGNOSIS_SCHEMA,
  },
  refineDifferentials: {
    instructionKey: "DIFFERENTIAL_REFINER_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: DIFFERENTIAL_DIAGNOSIS_SCHEMA,
  },
  synthesizeImpression: {
    instructionKey: "IMPRESSION_SYNTHESIZER_SYSTEM_INSTRUCTION",
    requestType: "stream",
  },
  answerQuery: {
    instructionKey: "QUERY_SYSTEM_INSTRUCTION",
    requestType: "stream",
  },
  selectGuidelines: {
    instructionKey: "GUIDELINE_SELECTION_SYSTEM_INSTRUCTION",
    requestType: "json",
    schema: GUIDELINE_SELECTION_SCHEMA,
  },
  generateImage: {
    requestType: "image",
  },
  rundownAppropriateness: {
    instructionKey: "RUNDOWN_APPROPRIATENESS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownTopFacts: {
    instructionKey: "RUNDOWN_TOP_FACTS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownWhatToLookFor: {
    instructionKey: "RUNDOWN_WHAT_TO_LOOK_FOR_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownPitfalls: {
    instructionKey: "RUNDOWN_PITFALLS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownSearchPattern: {
    instructionKey: "RUNDOWN_SEARCH_PATTERN_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownPertinentNegatives: {
    instructionKey: "RUNDOWN_PERTINENT_NEGATIVES_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownClassicSigns: {
    instructionKey: "RUNDOWN_CLASSIC_SIGNS_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
  rundownBottomLine: {
    instructionKey: "RUNDOWN_BOTTOM_LINE_INSTRUCTION",
    requestType: "normal",
    temperature: 0.3,
  },
};

export const runAiTask = async <T>(
  task: AiTaskType,
  payload: {
    prompt: string;
    onChunk?: (chunk: string) => void;
    signal?: AbortSignal;
  },
): Promise<T> => {
  const { settings } = useWorkflowStore.getState();
  const config = TASK_CONFIGS[task];

  if (!settings) {
    throw new AiTaskError("Settings are not loaded.", { task });
  }

  const activeProvider = settings.providers.find(
    (p) => p.id === settings.activeProviderId,
  );
  if (!activeProvider) {
    throw new AiTaskError("No active API provider selected.", { task });
  }

  const modelAssignments = settings.modelAssignments[activeProvider.id];
  const model = modelAssignments ? modelAssignments[task] : "";

  if (!model || !model.trim()) {
    throw new AiTaskError(
      `No model assigned for the task '${task}' with the provider '${activeProvider.name}'. Please check your settings.`,
      { task },
    );
  }

  logEvent(`AI Task Started: ${task}`, {
    provider: activeProvider.name,
    model,
  });

  try {
    const systemInstruction = config.instructionKey
      ? settings.prompts[config.instructionKey]
      : "";

    const commonPayload = {
      provider: activeProvider,
      model,
      systemInstruction,
      prompt: payload.prompt,
      onChunk: payload.onChunk,
      temperature: config.temperature,
      signal: payload.signal,
    };

    let result: any;

    // Unified handler for appropriateness-related tasks (getGuidance is deprecated, use getAppropriateness)
    if (task === "getGuidance" || task === "getAppropriateness") {
      const taskLabel = task === "getGuidance" ? "guidance" : "appropriateness";

      if (activeProvider.providerId === "google") {
        logEvent(
          `Running ${taskLabel} task without grounding (temperature 0.3).`,
        );
        const fullText =
          await multiProviderAiService.generateStream(commonPayload);

        // Check if appropriateness is indeterminate and retry with grounding
        if (fullText.includes("[INDETERMINATE]")) {
          logEvent("Appropriateness indeterminate, retrying with grounding...");

          const groundingResult =
            await multiProviderAiService.generateWithGrounding({
              ...commonPayload,
              prompt: `${payload.prompt}\n\nFOCUS: You previously could not determine appropriateness. Use Google Search to find the ACR Appropriateness Criteria and determine if this study is [CONSISTENT] or [INCONSISTENT]. Replace the [INDETERMINATE] tag with your determination.`,
            });

          const groundedText = groundingResult.text;
          const appropriatenessMatch = groundedText.match(
            /\[(CONSISTENT|INCONSISTENT):[^\]]+\]/,
          );

          if (appropriatenessMatch) {
            const updatedText = fullText.replace(
              "[INDETERMINATE]",
              appropriatenessMatch[0],
            );
            result = { text: updatedText, sources: groundingResult.sources };
          } else {
            result = { text: fullText, sources: [] };
          }
        } else {
          result = { text: fullText, sources: [] };
        }
      } else {
        logEvent(
          `Running ${taskLabel} task with LLM knowledge (no grounding).`,
        );
        const fullText =
          await multiProviderAiService.generateStream(commonPayload);
        result = { text: fullText, sources: [] };
      }
    } else {
      switch (config.requestType) {
        case "json":
          result = await multiProviderAiService.generateJson(
            commonPayload,
            config.schema,
          );
          break;
        case "stream":
          // The generateStream function calls onChunk during the stream,
          // and also returns the full text upon completion.
          result = await multiProviderAiService.generateStream(commonPayload);
          break;
        case "normal":
          // Normal request type - just returns the text without streaming
          result = await multiProviderAiService.generateStream(commonPayload);
          break;
        case "image":
          result = await multiProviderAiService.generateImage(commonPayload);
          break;
      }
    }

    logEvent(`AI Task Success: ${task}`);
    return result as T;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    logError(`Orchestrator (${task})`, {
      message,
      provider: activeProvider.name,
      model,
    });
    // Re-throw a standardized error for the slice to catch
    throw new AiTaskError(message, {
      task,
      provider: activeProvider.name,
      model,
    });
  }
};
