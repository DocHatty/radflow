// types.ts

export interface Theme {
  colors: {
    base: string;
    gradientBgFrom: string;
    panelBg: string;
    panelHighlight: string;
    primary: string;
    primaryGlow: string;
    secondary: string;
    secondaryHighlight: string;
    gradientFrom: string;
    gradientTo: string;
    gradientTextTo: string;
    textDefault: string;
    textMuted: string;
    textBright: string;
    border: string;
    borderHover: string;
    pulseGlow1: string;
    pulseGlow2: string;
    shadowDefault: string;
    scrollbarThumb: string;
    interactiveBg: string;
    interactiveBgHover: string;
    inputBg: string;
    inputBgFocus: string;
    // Status Colors
    successBg: string;
    successBorder: string;
    successText: string;
    warningBg: string;
    warningBorder: string;
    warningText: string;
    warningPulseBorder: string;
    dangerBg: string;
    dangerBorder: string;
    dangerText: string;
    infoBg: string;
    infoBorder: string;
    infoText: string;
    // Disabled States
    disabledBg: string;
    disabledText: string;
    // Semantic Colors
    priorFindingHighlightBg: string;
    priorFindingHighlightBorder: string;
    priorFindingHighlightText: string;
  };
}

export type RejectableItem = { value: string; isRejected?: boolean };

export type LabResult = { name: string; value: string };

export type Prior = { content: string; date: string };

export interface ParsedInput {
  studyType?: { value: string };
  examDate?: { value: string };
  clinicalHistory?: { value: string };
  reasonForStudy?: { value: string };
  allergies?: RejectableItem[];
  medications?: RejectableItem[];
  surgeries?: RejectableItem[];
  labs?: LabResult[];
  priors?: Prior[];
  unmatchedText?: RejectableItem[];
}

export type RejectableCategory =
  | "allergies"
  | "medications"
  | "surgeries"
  | "unmatchedText";

export interface AppError {
  message: string;
  context?: string;
}

export type PromptKey =
  | "CATEGORIZATION_SYSTEM_INSTRUCTION"
  | "INITIAL_DRAFT_SYSTEM_INSTRUCTION"
  | "GUIDANCE_SYSTEM_INSTRUCTION" // Keeping for backward compatibility if needed, or can be removed
  | "APPROPRIATENESS_SYSTEM_INSTRUCTION"
  | "DETAILED_GUIDANCE_SYSTEM_INSTRUCTION"
  | "REFINE_SYSTEM_INSTRUCTION"
  | "DICTATION_INTEGRATION_SYSTEM_INSTRUCTION"
  | "FINAL_REVIEW_SYSTEM_INSTRUCTION"
  | "APPLY_RECOMMENDATION_SYSTEM_INSTRUCTION"
  | "DIFFERENTIAL_GENERATOR_SYSTEM_INSTRUCTION"
  | "DIFFERENTIAL_REFINER_SYSTEM_INSTRUCTION"
  | "IMPRESSION_SYNTHESIZER_SYSTEM_INSTRUCTION"
  | "QUERY_SYSTEM_INSTRUCTION"
  | "GUIDELINE_SELECTION_SYSTEM_INSTRUCTION"
  | "RUNDOWN_MOST_LIKELY_INSTRUCTION"
  | "RUNDOWN_TOP_FACTS_INSTRUCTION"
  | "RUNDOWN_WHAT_TO_LOOK_FOR_INSTRUCTION"
  | "RUNDOWN_PITFALLS_INSTRUCTION"
  | "RUNDOWN_SEARCH_PATTERN_INSTRUCTION"
  | "RUNDOWN_PERTINENT_NEGATIVES_INSTRUCTION"
  | "RUNDOWN_CLASSIC_SIGNS_INSTRUCTION"
  | "RUNDOWN_BOTTOM_LINE_INSTRUCTION"
  | "RUNDOWN_APPROPRIATENESS_INSTRUCTION";

export type ProviderId = "google" | "openai" | "anthropic" | "openrouter" | "perplexity";

export interface ApiProvider {
  id: string; // Unique identifier for the provider configuration
  providerId: ProviderId; // The type of provider
  name: string; // User-defined name
  apiKey: string; // The API key
  baseUrl?: string; // Optional base URL for proxies or self-hosted
}

export type ModelAssignment = Record<AiTaskType, string>;

export interface Settings {
  prompts: Record<PromptKey, string>;
  themes: Theme[];
  providers: ApiProvider[];
  activeProviderId: string;
  modelAssignments: Record<string, ModelAssignment>; // Keyed by provider config ID
}

export interface DiagnosticMessage {
  timestamp: Date;
  type: "log" | "error";
  message: string;
  data?: string;
}

export interface DifferentialDiagnosis {
  name: string;
  rationale: string;
  likelihood: "High" | "Medium" | "Low";
}

export type CopilotView = "guidance" | "differentials" | "review";

export type AiTaskType =
  | "categorize"
  | "draftReport"
  | "getGuidance" // Keeping for backward compatibility
  | "getAppropriateness"
  | "getDetailedGuidance"
  | "refineReport"
  | "integrateDictation"
  | "finalReview"
  | "applyRecommendations"
  | "generateDifferentials"
  | "refineDifferentials"
  | "synthesizeImpression"
  | "answerQuery"
  | "selectGuidelines"
  | "generateImage" // Added for background generation
  | "rundownAppropriateness"
  | "rundownMostLikely"
  | "rundownTopFacts"
  | "rundownWhatToLookFor"
  | "rundownPitfalls"
  | "rundownSearchPattern"
  | "rundownPertinentNegatives"
  | "rundownClassicSigns"
  | "rundownBottomLine";

export interface FetchedModel {
  id: string;
  name: string;
}
