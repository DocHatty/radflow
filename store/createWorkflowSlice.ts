import { StateCreator } from "zustand";
import { logEvent } from "../services/loggingService";
import { runAiTask } from "../services/aiOrchestrator";
import { constructBriefFromParsedInput } from "../services/clinicalUtils";
import {
  findTemplateForStudy,
  GENERIC_NORMAL_TEMPLATE,
} from "../components/reportTemplates";
import {
  Guideline,
  FOLLOW_UP_GUIDELINES,
} from "../guidelines/followUpGuidelines";
import type {
  ParsedInput,
  RejectableCategory,
  RejectableItem,
  LabResult,
  Prior,
  Settings,
  AppError,
  DiagnosticMessage,
  DifferentialDiagnosis,
  PromptKey,
  CopilotView,
  AiTaskType,
} from "../types";
import { SettingsSlice } from "./createSettingsSlice";
import {
  RundownData,
  initializeRundownData,
  generateRundownParallel,
} from "../services/rundownService";

export type WorkflowStage = "input" | "verification" | "submitted";
export type ActiveProcess =
  | "idle"
  | "categorizing"
  | "generating"
  | "refining"
  | "integrating"
  | "fetchingFinalReview"
  | "applyingChanges"
  | "generatingDifferentials"
  | "synthesizingImpression"
  | "querying"
  | "generatingRundown";

const MAX_DIAGNOSTIC_MESSAGES = 150;

// --- STATE SLICE INTERFACE ---
export interface WorkflowSlice {
  // Core App State
  workflowStage: WorkflowStage;
  activeProcess: ActiveProcess;
  error: AppError | null;
  isInitializing: boolean;
  isAiReady: boolean;

  // UI State
  isDiagnosticsPanelOpen: boolean;

  // Data State
  userInput: string;
  parsedInfo: ParsedInput | null;
  editableReportContent: string;
  guidanceContent: string;
  isFetchingGuidance: boolean;
  guidanceSources: Array<{ uri: string; title: string }>;
  finalReviewContent: string[];
  isFinalReviewAllClear: boolean;
  activeGuidelines: Guideline[];
  copilotView: CopilotView;
  diagnosticMessages: DiagnosticMessage[];
  differentials: DifferentialDiagnosis[] | null;
  selectedDifferentials: DifferentialDiagnosis[];
  qaHistory: Array<{ role: "user" | "model"; content: string }>;
  contrastClarificationNeeded: { studyType: string } | null;
  examDateInput: string;
  rundownData: RundownData | null;
  isGeneratingRundown: boolean;

  // Actions
  init: () => Promise<void>;
  resetWorkflow: () => void;
  setError: (error: AppError | null) => void;
  setProcess: (process: ActiveProcess) => void;
  toggleDiagnosticsPanel: () => void;
  setUserInput: (input: string) => void;
  setEditableReportContent: (content: string) => void;
  setExamDateInput: (date: string) => void;
  submitInput: () => Promise<void>;
  updateParsedInfo: (
    category: keyof ParsedInput,
    newValue: string,
    index?: number,
    field?: keyof LabResult | keyof Prior | "value",
  ) => void;
  rejectItem: (category: RejectableCategory, indexToToggle: number) => void;
  confirmBrief: () => Promise<void>;
  reviseBrief: () => void;
  refineReport: () => Promise<void>;
  integrateDictation: (dictatedText: string) => Promise<void>;
  fetchFinalReview: () => Promise<void>;
  applyRecommendations: (recommendations: string[]) => Promise<void>;
  addDiagnostic: (type: "log" | "error", message: string, data?: any) => void;
  clearDiagnostics: () => void;
  generateDifferentials: () => Promise<void>;
  updateSelectedDifferentials: (differentials: DifferentialDiagnosis[]) => void;
  synthesizeImpression: () => Promise<void>;
  submitQuery: (query: string) => Promise<void>;
  clearQueryHistory: () => void;
  setCopilotView: (view: CopilotView) => void;
  resolveContrastClarification: (contrastChoice: string) => void;
  generateRundown: () => Promise<void>;
  updateRundownSection: (key: keyof RundownData, content: string) => void;
}

const getCurrentDateTimeString = () =>
  new Date()
    .toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");

const initialState = {
  workflowStage: "input" as WorkflowStage,
  activeProcess: "idle" as ActiveProcess,
  error: null,
  isInitializing: true,
  isAiReady: false,
  isDiagnosticsPanelOpen: false,
  userInput: "",
  parsedInfo: null,
  editableReportContent: "",
  guidanceContent: "",
  isFetchingGuidance: false,
  guidanceSources: [],
  finalReviewContent: [],
  isFinalReviewAllClear: false,
  activeGuidelines: [],
  copilotView: "guidance" as CopilotView,
  diagnosticMessages: [],
  differentials: null,
  selectedDifferentials: [],
  qaHistory: [],
  contrastClarificationNeeded: null,
  examDateInput: getCurrentDateTimeString(),
  rundownData: null,
  isGeneratingRundown: false,
};

// Global AbortController for cancelling in-flight guidance requests
let guidanceAbortController: AbortController | null = null;

/**
 * Cancels any in-flight guidance requests. Call this before starting new requests
 * or when navigating away from a stage that has pending requests.
 */
const cancelGuidanceRequests = () => {
  if (guidanceAbortController) {
    guidanceAbortController.abort();
    guidanceAbortController = null;
  }
};

/**
 * Creates a new AbortController for guidance requests.
 * Automatically cancels any existing controller first.
 */
const createGuidanceAbortController = (): AbortController => {
  cancelGuidanceRequests();
  guidanceAbortController = new AbortController();
  return guidanceAbortController;
};

/**
 * Creates a robust stream handler that buffers incoming text chunks and updates
 * the Zustand state using requestAnimationFrame. This prevents UI lag and state
 * corruption by batching rapid updates into a single render frame.
 *
 * OPTIMIZATION: Uses array accumulation instead of string concatenation to avoid
 * O(n²) complexity. Each chunk is pushed to an array (O(1)), then joined on flush (O(n)).
 *
 * @param set - The Zustand set function.
 * @param updateFn - A function that takes the current state and the buffered chunk
 * and returns the new state partial.
 * @returns An object with onChunk and flush methods.
 */
const createStreamHandler = (
  set: (
    fn: (
      state: WorkflowSlice & SettingsSlice,
    ) =>
      | Partial<WorkflowSlice & SettingsSlice>
      | (WorkflowSlice & SettingsSlice),
  ) => void,
  updateFn: (
    state: WorkflowSlice,
    bufferedChunk: string,
  ) => Partial<WorkflowSlice>,
) => {
  // Use array instead of string concatenation for O(1) appends
  const chunks: string[] = [];
  let frameId: number | null = null;

  const onChunk = (chunk: string) => {
    chunks.push(chunk); // O(1) instead of O(n) string concatenation
    if (!frameId) {
      frameId = requestAnimationFrame(() => {
        if (chunks.length > 0) {
          const buffer = chunks.join(""); // O(n) - done once per frame
          chunks.length = 0; // Clear array efficiently
          set((state) => updateFn(state as WorkflowSlice, buffer));
        }
        frameId = null;
      });
    }
  };

  const flush = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    if (chunks.length > 0) {
      const buffer = chunks.join("");
      chunks.length = 0;
      set((state) => updateFn(state as WorkflowSlice, buffer));
    }
  };

  return { onChunk, flush };
};

// --- SLICE CREATOR FUNCTION ---
export const createWorkflowSlice: StateCreator<
  WorkflowSlice & SettingsSlice,
  [],
  [],
  WorkflowSlice
> = (set, get) => ({
  ...initialState,

  init: async () => {
    logEvent("App Initialization Started");
    set({ isInitializing: true });

    get()._loadSettings();

    // Small delay to ensure state updates from _loadSettings propagate
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Future async initialization can go here.
      set({ isAiReady: true });
      logEvent("AI Services Ready");
    } catch (e) {
      const error =
        e instanceof Error ? e.message : "Unknown initialization error";
      get().setError({
        message: `Failed to initialize AI. ${error}`,
        context: "Initialization",
      });
    } finally {
      set({ isInitializing: false });
      logEvent("App Initialization Finished");
    }
  },

  resetWorkflow: () => {
    logEvent("Workflow Reset");
    get().clearQueryHistory();
    set({
      ...initialState,
      examDateInput: getCurrentDateTimeString(),
      qaHistory: [],
      isAiReady: get().isAiReady,
      isInitializing: false,
    });
  },

  setError: (error) => {
    if (error) {
      logEvent("Error Set", { context: error.context, message: error.message });
    }
    set({ error, activeProcess: "idle" });
  },

  setProcess: (process) => set({ activeProcess: process, error: null }),

  toggleDiagnosticsPanel: () =>
    set((state) => {
      const isOpen = !state.isDiagnosticsPanelOpen;
      logEvent("Diagnostics Panel Toggled", { isOpen });
      return { isDiagnosticsPanelOpen: isOpen };
    }),

  setUserInput: (input) => set({ userInput: input }),
  setEditableReportContent: (content) =>
    set({ editableReportContent: content }),
  setExamDateInput: (date) => set({ examDateInput: date }),

  submitInput: async () => {
    const { userInput, examDateInput, setProcess, setError } = get();
    if (!userInput.trim()) return;

    const combinedInput = `Date of Exam: ${examDateInput}\n\n${userInput}`;

    setProcess("categorizing");
    try {
      const parsedData = await runAiTask<ParsedInput>("categorize", {
        prompt: combinedInput,
      });

      const studyType = parsedData.studyType?.value?.toLowerCase() || "";
      const needsContrastClarification =
        /ct|mri|mra|cta/.test(studyType) &&
        !/contrast|w\/|w\/o|without|with and without/.test(studyType);

      if (needsContrastClarification) {
        logEvent("Contrast clarification needed", { studyType });
        set({
          parsedInfo: parsedData,
          contrastClarificationNeeded: {
            studyType: parsedData.studyType?.value || "",
          },
        });
      } else {
        set({ parsedInfo: parsedData, workflowStage: "verification" });
      }

      // --- PRE-FETCH GUIDANCE IN BACKGROUND (PARALLEL) ---
      // Start guidance generation early while user reviews the verification screen
      const clinicalBrief = constructBriefFromParsedInput(parsedData);

      // Create new AbortController for this batch of requests (cancels any previous)
      const abortController = createGuidanceAbortController();
      const signal = abortController.signal;

      logEvent("Starting PARALLEL pre-fetch of guidance...");
      set({
        isFetchingGuidance: true,
        guidanceContent: "",
        rundownData: initializeRundownData(),
        isGeneratingRundown: true,
      });

      // Mark all rundown sections as loading
      set((state) => {
        if (!state.rundownData) return state;
        const updatedData = { ...state.rundownData };
        Object.keys(updatedData).forEach((key) => {
          updatedData[key as keyof RundownData].isLoading = true;
        });
        return { rundownData: updatedData };
      });

      const contextPrompt = `Study Type: ${parsedData.studyType?.value || "Unknown"}\nClinical Context: ${clinicalBrief}`;

      // PARALLEL: Fire appropriateness and all rundown sections simultaneously
      const appropriatenessPromise = runAiTask<{
        text: string;
        sources: any[];
      }>("getAppropriateness", {
        prompt: clinicalBrief,
        signal,
      })
        .then((result) => {
          if (!signal.aborted) {
            set({
              guidanceContent: result.text,
              guidanceSources: result.sources,
            });
          }
        })
        .catch((error) => {
          // Ignore abort errors - they're expected when navigating away
          if (error.name !== "AbortError") {
            logEvent("Appropriateness fetch failed", { error: error.message });
          }
        });

      // Fire all rundown sections in parallel
      const rundownPromise = generateRundownParallel(
        contextPrompt,
        (key, content) => {
          if (!signal.aborted) {
            set((state) => {
              if (!state.rundownData) return state;
              const safeContent = content || "";
              return {
                rundownData: {
                  ...state.rundownData,
                  [key]: {
                    ...state.rundownData[key],
                    content: safeContent,
                    isLoading: false,
                    error: safeContent.startsWith("Error:")
                      ? safeContent
                      : undefined,
                  },
                },
              };
            });
          }
        },
        signal,
      );

      // Wait for both to complete with proper error handling
      Promise.allSettled([appropriatenessPromise, rundownPromise]).then(
        (results) => {
          if (!signal.aborted) {
            set({ isFetchingGuidance: false, isGeneratingRundown: false });
            logEvent("Parallel guidance pre-fetch complete");

            // Log any failures for debugging
            results.forEach((result, index) => {
              if (
                result.status === "rejected" &&
                result.reason?.name !== "AbortError"
              ) {
                logEvent(`Pre-fetch task ${index} failed`, {
                  error: result.reason?.message,
                });
              }
            });
          }
        },
      );

      // Also pre-fetch guideline selection
      const guidelineKnowledgeBase = FOLLOW_UP_GUIDELINES.map(
        (g) => `Topic: ${g.topic}\nSummary: ${g.summary}`,
      ).join("\n\n");

      runAiTask<{ relevantGuidelineTopics: string[] }>("selectGuidelines", {
        prompt: `**Clinical Brief:**\n${clinicalBrief}\n\n**Available Guidelines:**\n${guidelineKnowledgeBase}`,
        signal,
      })
        .then((result) => {
          if (!signal.aborted) {
            const relevantTopics = new Set(result.relevantGuidelineTopics);
            const activeGuidelines = FOLLOW_UP_GUIDELINES.filter((g) =>
              relevantTopics.has(g.topic),
            );
            set({ activeGuidelines });
            logEvent("Pre-fetched guidelines ready", {
              selected: activeGuidelines.map((g) => g.topic),
            });
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            logEvent("Pre-fetch guidelines failed", { error: error.message });
          }
        });
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Categorizing Input" });
    } finally {
      setProcess("idle");
    }
  },

  resolveContrastClarification: (contrastChoice: string) =>
    set((state) => {
      if (
        !state.parsedInfo ||
        !state.parsedInfo.studyType ||
        !state.contrastClarificationNeeded
      )
        return {};

      const newStudyType = `${state.contrastClarificationNeeded.studyType} ${contrastChoice}`;

      const newParsedInfo: ParsedInput = {
        ...state.parsedInfo,
        studyType: { value: newStudyType },
      };

      logEvent("Contrast clarification resolved", { newStudyType });

      return {
        parsedInfo: newParsedInfo,
        contrastClarificationNeeded: null,
        workflowStage: "verification",
      };
    }),

  updateParsedInfo: (category, newValue, index, field = "value") =>
    set((state) => {
      if (!state.parsedInfo) return {};

      const newInfo = { ...state.parsedInfo }; // Shallow copy of top level
      const targetCategory = newInfo[category];

      if (index !== undefined && Array.isArray(targetCategory)) {
        const newList = JSON.parse(JSON.stringify(targetCategory));
        if (newList[index]) {
          newList[index][field] = newValue;
          (newInfo as any)[category] = newList;
        }
      } else {
        const newObject = targetCategory
          ? JSON.parse(JSON.stringify(targetCategory))
          : {};
        newObject[field] = newValue;
        (newInfo as any)[category] = newObject;
      }

      return { parsedInfo: newInfo };
    }),

  rejectItem: (category, indexToToggle) =>
    set((state) => {
      if (!state.parsedInfo) return {};
      const list = state.parsedInfo[category] as RejectableItem[] | undefined;
      if (!list || !list[indexToToggle]) return {};

      const newList = [...list];
      newList[indexToToggle] = {
        ...newList[indexToToggle],
        isRejected: !newList[indexToToggle].isRejected,
      };

      return { parsedInfo: { ...state.parsedInfo, [category]: newList } };
    }),

  confirmBrief: async () => {
    const {
      parsedInfo,
      guidanceContent,
      activeGuidelines,
      setProcess,
      setError,
    } = get();
    if (!parsedInfo) return;

    if (!parsedInfo.examDate?.value?.trim()) {
      setError({
        message:
          "Please enter the date of the exam before generating the report.",
        context: "Missing Required Field",
      });
      return;
    }

    setProcess("generating");

    // Store pre-fetched guidance/guidelines/rundown before clearing
    const preFetchedGuidance = guidanceContent;
    const preFetchedGuidelines = activeGuidelines;
    const preFetchedRundown = get().rundownData;
    const isRundownGenerating = get().isGeneratingRundown;

    set({
      workflowStage: "submitted",
      copilotView: "guidance",
      editableReportContent: "",
      guidanceContent: preFetchedGuidance, // Preserve pre-fetched guidance
      activeGuidelines: preFetchedGuidelines, // Preserve pre-fetched guidelines
      rundownData: preFetchedRundown, // Preserve pre-fetched rundown
      isGeneratingRundown: isRundownGenerating, // Preserve loading state
      differentials: null,
    });

    const clinicalBrief = constructBriefFromParsedInput(parsedInfo);

    // --- Start background tasks (only if not already pre-fetched) ---
    let guidancePromise = Promise.resolve();
    let guidelineSelectionPromise = Promise.resolve();

    const { isFetchingGuidance } = get();

    if (!preFetchedGuidance && !isFetchingGuidance) {
      logEvent("No pre-fetched guidance found, fetching now (parallel)");

      // Create new AbortController for this batch
      const abortController = createGuidanceAbortController();
      const signal = abortController.signal;

      set({
        isFetchingGuidance: true,
        rundownData: initializeRundownData(),
        isGeneratingRundown: true,
      });

      // Mark all rundown sections as loading
      set((state) => {
        if (!state.rundownData) return state;
        const updatedData = { ...state.rundownData };
        Object.keys(updatedData).forEach((key) => {
          updatedData[key as keyof RundownData].isLoading = true;
        });
        return { rundownData: updatedData };
      });

      const contextPrompt = `Study Type: ${parsedInfo.studyType?.value || "Unknown"}\nClinical Context: ${clinicalBrief}`;

      // PARALLEL: Fetch appropriateness and rundown sections simultaneously
      const appropriatenessPromise = runAiTask<{
        text: string;
        sources: any[];
      }>("getAppropriateness", { prompt: clinicalBrief, signal })
        .then((result) => {
          if (!signal.aborted) {
            set({
              guidanceContent: result.text,
              guidanceSources: result.sources,
            });
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            logEvent("Appropriateness task failed", { error: error.message });
          }
        });

      const rundownPromise = generateRundownParallel(
        contextPrompt,
        (key, content) => {
          if (!signal.aborted) {
            set((state) => {
              if (!state.rundownData) return state;
              const safeContent = content || "";
              return {
                rundownData: {
                  ...state.rundownData,
                  [key]: {
                    ...state.rundownData[key],
                    content: safeContent,
                    isLoading: false,
                    error: safeContent.startsWith("Error:")
                      ? safeContent
                      : undefined,
                  },
                },
              };
            });
          }
        },
        signal,
      );

      guidancePromise = Promise.allSettled([
        appropriatenessPromise,
        rundownPromise,
      ]).then((results) => {
        if (!signal.aborted) {
          set({ isFetchingGuidance: false, isGeneratingRundown: false });
          // Log failures for debugging
          results.forEach((result, index) => {
            if (
              result.status === "rejected" &&
              result.reason?.name !== "AbortError"
            ) {
              logEvent(`Guidance task ${index} failed`, {
                error: result.reason?.message,
              });
            }
          });
        }
      });
    } else {
      logEvent("Using pre-fetched guidance (instant load or already fetching)");
    }

    if (!preFetchedGuidelines || preFetchedGuidelines.length === 0) {
      const guidelineKnowledgeBase = FOLLOW_UP_GUIDELINES.map(
        (g) => `Topic: ${g.topic}\nSummary: ${g.summary}`,
      ).join("\n\n");
      guidelineSelectionPromise = runAiTask<{
        relevantGuidelineTopics: string[];
      }>("selectGuidelines", {
        prompt: `**Clinical Brief:**\n${clinicalBrief}\n\n**Available Guidelines:**\n${guidelineKnowledgeBase}`,
      })
        .then((result) => {
          const relevantTopics = new Set(result.relevantGuidelineTopics);
          const activeGuidelines = FOLLOW_UP_GUIDELINES.filter((g) =>
            relevantTopics.has(g.topic),
          );
          set({ activeGuidelines });
          logEvent("Guideline selection complete", {
            selected: activeGuidelines.map((g) => g.topic),
          });
        })
        .catch((error) => {
          logEvent("Guideline selection task failed but workflow continues", {
            error,
          });
        });
    } else {
      logEvent("Using pre-fetched guidelines (instant load)");
    }

    // --- Handle critical path (draft -> differentials) ---
    // This is awaited directly to provide the user with the report draft as fast as possible.
    try {
      const reportTemplate =
        findTemplateForStudy(parsedInfo.studyType?.value) ||
        GENERIC_NORMAL_TEMPLATE;
      const draftContent = await runAiTask<string>("draftReport", {
        prompt: `**Clinical Brief:**\n${clinicalBrief}\n\n**Base Report Template:**\n${reportTemplate.findings}\n${reportTemplate.impression}`,
      });
      set({ editableReportContent: draftContent });

      // DO NOT generate differentials here - only after dictation

      // Let background tasks finish without blocking UI, with proper error handling
      Promise.allSettled([guidancePromise, guidelineSelectionPromise]).then(
        (results) => {
          results.forEach((result, index) => {
            if (
              result.status === "rejected" &&
              result.reason?.name !== "AbortError"
            ) {
              const taskName = index === 0 ? "Guidance" : "Guideline Selection";
              logEvent(`${taskName} background task failed`, {
                error: result.reason?.message,
              });
            }
          });
        },
      );

      setProcess("idle");
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Generating Report Draft" });
      setProcess("idle");
    }
  },

  generateDifferentials: async () => {
    const { editableReportContent, setProcess, setError } = get();

    if (!editableReportContent.trim()) {
      return;
    }

    const findingsMatch = editableReportContent.match(
      /FINDINGS:([\s\S]*?)IMPRESSION:/i,
    );
    const findingsText = findingsMatch
      ? findingsMatch[1].trim()
      : editableReportContent;

    if (!findingsText) {
      logEvent("Differential generation skipped: No findings found.");
      return;
    }

    setProcess("generatingDifferentials");
    try {
      const result = await runAiTask<{ diagnoses: DifferentialDiagnosis[] }>(
        "generateDifferentials",
        { prompt: findingsText },
      );
      const diagnoses = result.diagnoses || [];
      logEvent("Differentials generated", { count: diagnoses.length });
      set({
        differentials: diagnoses,
        selectedDifferentials: diagnoses,
        copilotView: "differentials", // Auto-switch to differentials view
      });
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Generating Differentials" });
    } finally {
      setProcess("idle");
    }
  },

  updateSelectedDifferentials: (differentials) =>
    set({ selectedDifferentials: differentials }),

  synthesizeImpression: async () => {
    const {
      editableReportContent,
      selectedDifferentials,
      parsedInfo,
      setProcess,
      setError,
    } = get();
    if (selectedDifferentials.length === 0 || !parsedInfo) {
      logEvent("Impression synthesis skipped: No differentials selected.");
      set({ copilotView: "review" });
      get().fetchFinalReview(); // Run review in background, don't block UI
      return;
    }

    setProcess("synthesizingImpression");
    try {
      const findingsMatch = editableReportContent.match(
        /FINDINGS:([\s\S]*?)(IMPRESSION:|$)/i,
      );
      const findingsText = findingsMatch ? findingsMatch[1].trim() : "";
      let reportBase = findingsMatch
        ? findingsMatch[0].replace(/IMPRESSION:[\s\S]*/i, "IMPRESSION:")
        : `FINDINGS:\n${editableReportContent}\n\nIMPRESSION:`;
      if (!reportBase.endsWith("IMPRESSION:")) reportBase += "\n\nIMPRESSION:";

      set({ copilotView: "review", editableReportContent: reportBase + "\n" });

      const impressionText = await runAiTask<string>("synthesizeImpression", {
        prompt: `**CLINICAL BRIEF:**\n${constructBriefFromParsedInput(parsedInfo)}\n\n**FINDINGS:**\n${findingsText}\n\n**CURATED DIFFERENTIALS:**\n${selectedDifferentials.map((d) => `- ${d.name} (Likelihood: ${d.likelihood}): ${d.rationale}`).join("\n")}`,
      });

      set((state) => ({
        editableReportContent: state.editableReportContent + impressionText,
      }));

      setProcess("idle");

      // Run final review in background without blocking UI
      get().fetchFinalReview();
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Synthesizing Impression" });
      setProcess("idle");
    }
  },

  reviseBrief: () => {
    logEvent("Revising Brief");
    // Cancel any in-flight guidance requests to prevent stale updates
    cancelGuidanceRequests();
    set({ workflowStage: "verification", copilotView: "guidance" });
  },

  refineReport: async () => {
    const { editableReportContent, setProcess, setError } = get();
    if (!editableReportContent.trim()) return;

    setProcess("refining");
    const originalContent = editableReportContent;
    try {
      set({ editableReportContent: "" });
      const refinedContent = await runAiTask<string>("refineReport", {
        prompt: originalContent,
      });
      set({ editableReportContent: refinedContent });
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Refining Report" });
      set({ editableReportContent: originalContent });
    } finally {
      setProcess("idle");
    }
  },

  integrateDictation: async (dictatedText) => {
    const { editableReportContent, setProcess, setError } = get();

    if (!dictatedText.trim()) {
      return;
    }

    setProcess("integrating");
    const originalContent = editableReportContent;

    try {
      set({ editableReportContent: "" });
      const integratedContent = await runAiTask<string>("integrateDictation", {
        prompt: `**Current Report:**\n${originalContent}\n\n**Dictated Text to Integrate:**\n${dictatedText}`,
      });
      set({ editableReportContent: integratedContent });

      // Generate differentials from updated report
      await get().generateDifferentials();

      setProcess("idle");
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Integrating Dictation" });
      set({ editableReportContent: originalContent });
      setProcess("idle");
    }
  },

  fetchFinalReview: async () => {
    const {
      editableReportContent,
      parsedInfo,
      activeGuidelines,
      setProcess,
      setError,
    } = get();
    if (!editableReportContent.trim() || !parsedInfo) return;

    setProcess("fetchingFinalReview");
    try {
      set({ finalReviewContent: [], isFinalReviewAllClear: false }); // No longer need to reset activeGuidelines
      const clinicalBrief = constructBriefFromParsedInput(parsedInfo);

      const guidelinesText =
        activeGuidelines.length > 0
          ? `**Relevant Guidelines:**\n${activeGuidelines.map((g) => `- ${g.topic}: ${g.llmSummary}`).join("\n")}`
          : "";

      const result = await runAiTask<{ recommendations: string[] }>(
        "finalReview",
        {
          prompt: `**Clinical Brief:**\n${clinicalBrief}\n\n**Final Report:**\n${editableReportContent}\n\n${guidelinesText}`,
        },
      );

      const recommendations = result.recommendations || [];
      set({
        finalReviewContent: recommendations,
        isFinalReviewAllClear: recommendations.length === 0,
        copilotView: "review",
      });
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Performing Final Review" });
    } finally {
      setProcess("idle");
    }
  },

  applyRecommendations: async (recommendations) => {
    const { editableReportContent, setProcess, setError } = get();
    if (recommendations.length === 0) return;

    setProcess("applyingChanges");
    const originalContent = editableReportContent;
    try {
      set({ editableReportContent: "" });
      const appliedContent = await runAiTask<string>("applyRecommendations", {
        prompt: `**Current Report:**\n${originalContent}\n\n**Instructions for revision:**\n${recommendations.map((r) => `- ${r}`).join("\n")}`,
      });
      set({
        editableReportContent: appliedContent,
        finalReviewContent: [],
        isFinalReviewAllClear: true,
      });
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Applying Recommendations" });
      set({ editableReportContent: originalContent });
    } finally {
      setProcess("idle");
    }
  },

  addDiagnostic: (type, message, data) =>
    set((state) => {
      const newData = data
        ? typeof data === "object"
          ? JSON.stringify(data, null, 2)
          : String(data)
        : undefined;
      const newMessages = [
        ...state.diagnosticMessages,
        { type, message, data: newData, timestamp: new Date() },
      ];
      if (newMessages.length > MAX_DIAGNOSTIC_MESSAGES) {
        newMessages.shift();
      }
      return { diagnosticMessages: newMessages };
    }),

  clearDiagnostics: () => set({ diagnosticMessages: [] }),

  submitQuery: async (query) => {
    const {
      qaHistory,
      parsedInfo,
      editableReportContent,
      setProcess,
      setError,
    } = get();
    if (!query.trim() || !parsedInfo) return;

    setProcess("querying");
    const newHistory = [
      ...qaHistory,
      { role: "user" as const, content: query },
    ];
    set({
      qaHistory: [...newHistory, { role: "model" as const, content: "" }],
    });

    const streamHandler = createStreamHandler(set, (state, chunk) => {
      const latestHistory = [...state.qaHistory];
      const lastMessage = latestHistory[latestHistory.length - 1];
      if (lastMessage && lastMessage.role === "model") {
        lastMessage.content += chunk;
      }
      return { qaHistory: latestHistory };
    });

    try {
      const clinicalBrief = constructBriefFromParsedInput(parsedInfo);
      const conversationContext = newHistory
        .map((item) => `${item.role}: ${item.content}`)
        .join("\n");

      const queryPromise = runAiTask("answerQuery", {
        prompt: `**Clinical Brief:**\n${clinicalBrief}\n\n**Draft Report:**\n${editableReportContent}\n\n**Conversation History:**\n${conversationContext}\n\n**New Question:**\n${query}`,
        onChunk: streamHandler.onChunk,
      });
      await queryPromise;
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Answering Query" });
      set((state) => ({ qaHistory: state.qaHistory.slice(0, -2) }));
    } finally {
      streamHandler.flush();
      setProcess("idle");
    }
  },

  clearQueryHistory: () => set({ qaHistory: [] }),

  setCopilotView: (view) => set({ copilotView: view }),

  generateRundown: async () => {
    const { parsedInfo, setProcess, setError } = get();
    if (!parsedInfo) return;

    setProcess("generatingRundown");
    set({
      isGeneratingRundown: true,
      rundownData: initializeRundownData(),
    });

    // Mark all sections as loading
    set((state) => {
      if (!state.rundownData) return state;
      const updatedData = { ...state.rundownData };
      Object.keys(updatedData).forEach((key) => {
        updatedData[key as keyof RundownData].isLoading = true;
      });
      return { rundownData: updatedData };
    });

    try {
      const clinicalBrief = constructBriefFromParsedInput(parsedInfo);
      const contextPrompt = `Study Type: ${parsedInfo.studyType?.value || "Unknown"}\nClinical Context: ${clinicalBrief}`;

      await generateRundownParallel(contextPrompt, (key, content) => {
        set((state) => {
          if (!state.rundownData) return state;
          const safeContent = content || "";
          return {
            rundownData: {
              ...state.rundownData,
              [key]: {
                ...state.rundownData[key],
                content: safeContent,
                isLoading: false,
                error: safeContent.startsWith("Error:")
                  ? safeContent
                  : undefined,
              },
            },
          };
        });
      });

      logEvent("Rundown generation completed");
    } catch (e) {
      const err = e as Error;
      setError({ message: err.message, context: "Generating Rundown" });
    } finally {
      set({ isGeneratingRundown: false });
      setProcess("idle");
    }
  },

  updateRundownSection: (key, content) => {
    set((state) => {
      if (!state.rundownData) return state;
      return {
        rundownData: {
          ...state.rundownData,
          [key]: {
            ...state.rundownData[key],
            content,
            isLoading: false,
          },
        },
      };
    });
  },
});
