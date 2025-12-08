// hooks/useWorkflowSelectors.ts
// Custom hooks with properly memoized Zustand selectors to prevent unnecessary re-renders
//
// PROBLEM SOLVED:
// Creating object literals in useWorkflowStore((state) => ({ ... })) causes
// re-renders on every state change because a new object is created each time.
//
// SOLUTION:
// Use Zustand's useShallow hook which performs shallow comparison of the
// returned object, only triggering re-renders when actual values change.

import { useShallow } from "zustand/react/shallow";
import { useWorkflowStore } from "../App";

/**
 * Selector for InputStage component
 */
export const useInputStageState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      userInput: state.userInput,
      setUserInput: state.setUserInput,
      submitInput: state.submitInput,
      isAiReady: state.isAiReady,
      activeProcess: state.activeProcess,
      examDateInput: state.examDateInput,
      setExamDateInput: state.setExamDateInput,
    }))
  );

/**
 * Selector for EditableReportArea component
 */
export const useEditableReportState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      rawContent: state.editableReportContent,
      onContentChange: state.setEditableReportContent,
      activeProcess: state.activeProcess,
      onReviseBrief: state.reviseBrief,
      onIntegrateDictation: state.integrateDictation,
      onFinalReview: state.fetchFinalReview,
      onRefine: state.refineReport,
    }))
  );

/**
 * Selector for CopilotPanel component
 */
export const useCopilotPanelState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      copilotView: state.copilotView,
      setCopilotView: state.setCopilotView,
      guidanceContent: state.guidanceContent,
      isFetchingGuidance: state.isFetchingGuidance,
      differentials: state.differentials,
      selectedDifferentials: state.selectedDifferentials,
      qaHistory: state.qaHistory,
      submitQuery: state.submitQuery,
      activeProcess: state.activeProcess,
    }))
  );

/**
 * Selector for DifferentialBuilder component
 */
export const useDifferentialBuilderState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      differentials: state.differentials,
      selectedDifferentials: state.selectedDifferentials,
      updateSelectedDifferentials: state.updateSelectedDifferentials,
      synthesizeImpression: state.synthesizeImpression,
      activeProcess: state.activeProcess,
    }))
  );

/**
 * Selector for FinalReviewPanel component
 */
export const useFinalReviewState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      recommendations: state.finalReviewContent,
      isLoading: state.activeProcess === "fetchingFinalReview",
      isAllClear: state.isFinalReviewAllClear,
      applyRecommendations: state.applyRecommendations,
      activeGuidelines: state.activeGuidelines,
      activeProcess: state.activeProcess,
    }))
  );

/**
 * Selector for EvolvingGuidance component
 */
export const useEvolvingGuidanceState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      guidanceContent: state.guidanceContent,
      isFetchingGuidance: state.isFetchingGuidance,
      guidanceSources: state.guidanceSources,
      rundownData: state.rundownData,
      isGeneratingRundown: state.isGeneratingRundown,
    }))
  );

/**
 * Selector for Header component
 */
export const useHeaderState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      workflowStage: state.workflowStage,
      resetWorkflow: state.resetWorkflow,
      parsedInfo: state.parsedInfo,
    }))
  );

/**
 * Selector for DiagnosticsPanel component
 */
export const useDiagnosticsState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      messages: state.diagnosticMessages,
      isOpen: state.isDiagnosticsPanelOpen,
      toggle: state.toggleDiagnosticsPanel,
      clear: state.clearDiagnostics,
    }))
  );

/**
 * Selector for SettingsPanel - settings slice
 */
export const useSettingsPanelState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
      addProvider: state.addProvider,
      updateProvider: state.updateProvider,
      removeProvider: state.removeProvider,
      setActiveProviderId: state.setActiveProviderId,
      updateModelAssignment: state.updateModelAssignment,
      availableModels: state.availableModels,
      setAvailableModels: state.setAvailableModels,
      isSettingsPanelOpen: state.isSettingsPanelOpen,
      toggleSettingsPanel: state.toggleSettingsPanel,
    }))
  );

/**
 * Selector for App component main state
 */
export const useAppState = () =>
  useWorkflowStore(
    useShallow((state) => ({
      workflowStage: state.workflowStage,
      isInitializing: state.isInitializing,
      isAiReady: state.isAiReady,
      error: state.error,
      setError: state.setError,
      init: state.init,
      settings: state.settings,
      parsedInfo: state.parsedInfo,
      contrastClarificationNeeded: state.contrastClarificationNeeded,
      resolveContrastClarification: state.resolveContrastClarification,
    }))
  );

/**
 * Atomic selectors for when you only need one or two values
 * These are already optimal - no useShallow needed for single values
 */
export const useWorkflowStage = () => useWorkflowStore((state) => state.workflowStage);
export const useIsAiReady = () => useWorkflowStore((state) => state.isAiReady);
export const useActiveProcess = () => useWorkflowStore((state) => state.activeProcess);
export const useError = () => useWorkflowStore((state) => state.error);
export const useParsedInfo = () => useWorkflowStore((state) => state.parsedInfo);
export const useSettings = () => useWorkflowStore((state) => state.settings);
export const useGuidanceContent = () => useWorkflowStore((state) => state.guidanceContent);
export const useIsFetchingGuidance = () => useWorkflowStore((state) => state.isFetchingGuidance);
export const useDifferentials = () => useWorkflowStore((state) => state.differentials);
export const useRundownData = () => useWorkflowStore((state) => state.rundownData);

// Action-only selectors (these never change, so no re-renders)
export const useResetWorkflow = () => useWorkflowStore((state) => state.resetWorkflow);
export const useSetError = () => useWorkflowStore((state) => state.setError);
export const useSubmitInput = () => useWorkflowStore((state) => state.submitInput);
