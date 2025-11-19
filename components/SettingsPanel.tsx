import React, { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from '../App';
import ActionButton from "./ActionButton";
import SecondaryButton from "./SecondaryButton";
import Accordion from "./Accordion";
import { XIcon, TrashIcon, InfoIcon, EyeIcon, EyeSlashIcon } from "./Icons";
import {
  Settings,
  PromptKey,
  ApiProvider,
  ProviderId,
  FetchedModel,
  ModelAssignment,
  AiTaskType,
} from "../types";
import { logError, logEvent } from "../services/loggingService";
import { fetchModels } from "../services/modelFetcherService";
import LoadingSpinner from "./LoadingSpinner";

// --- PROMPTS TAB ---

const promptDescriptions: Record<PromptKey, string> = {
  CATEGORIZATION_SYSTEM_INSTRUCTION:
    "Instructs the AI on how to parse raw clinical text into a structured JSON format. High precision is critical here.",
  INITIAL_DRAFT_SYSTEM_INSTRUCTION:
    "Guides the AI in creating the first report draft by combining a base template with the patient's clinical brief.",
  GUIDANCE_SYSTEM_INSTRUCTION:
    "Defines how the AI provides clinical guidance, forcing it to rely solely on grounded search results for appropriateness checks.",
  REFINE_SYSTEM_INSTRUCTION:
    'The prompt used when you click the "Refine" button. It tells the AI to improve grammar, clarity, and conciseness.',
  DICTATION_INTEGRATION_SYSTEM_INSTRUCTION:
    "Instructs the AI on how to intelligently merge dictated text into the most logical place in the current report draft.",
  FINAL_REVIEW_SYSTEM_INSTRUCTION:
    "The core logic for the Quality Assurance check. It instructs the AI to compare the report against the brief and guidelines.",
  APPLY_RECOMMENDATION_SYSTEM_INSTRUCTION:
    "Used when applying recommendations from the final review. Guides the AI to edit the report based on a list of instructions.",
  DIFFERENTIAL_GENERATOR_SYSTEM_INSTRUCTION:
    "Defines how the AI generates a list of potential differential diagnoses based only on the report findings.",
  IMPRESSION_SYNTHESIZER_SYSTEM_INSTRUCTION:
    'Guides the AI in writing the final "Impression" section by synthesizing the brief, findings, and selected differentials.',
  QUERY_SYSTEM_INSTRUCTION:
    "The prompt for the Q/A chat, instructing the AI to answer questions based on the clinical context and report.",
  // FIX: Add missing prompt description
  GUIDELINE_SELECTION_SYSTEM_INSTRUCTION:
    "Instructs the AI on how to select relevant clinical guidelines from a list based on the provided clinical brief.",
};

const promptGroups = [
  {
    title: "Data Extraction & Structuring",
    keys: ["CATEGORIZATION_SYSTEM_INSTRUCTION"] as PromptKey[],
  },
  {
    title: "Report Generation & Editing",
    keys: [
      "INITIAL_DRAFT_SYSTEM_INSTRUCTION",
      "REFINE_SYSTEM_INSTRUCTION",
      "DICTATION_INTEGRATION_SYSTEM_INSTRUCTION",
      "APPLY_RECOMMENDATION_SYSTEM_INSTRUCTION",
    ] as PromptKey[],
  },
  {
    title: "Diagnostic Assistance",
    keys: [
      "DIFFERENTIAL_GENERATOR_SYSTEM_INSTRUCTION",
      "IMPRESSION_SYNTHESIZER_SYSTEM_INSTRUCTION",
    ] as PromptKey[],
  },
  // FIX: Add missing prompt key to group
  {
    title: "Quality Assurance & Review",
    keys: [
      "GUIDANCE_SYSTEM_INSTRUCTION",
      "FINAL_REVIEW_SYSTEM_INSTRUCTION",
      "QUERY_SYSTEM_INSTRUCTION",
      "GUIDELINE_SELECTION_SYSTEM_INSTRUCTION",
    ] as PromptKey[],
  },
];

const PromptsTab: React.FC<{
  settings: Settings;
  onChange: (key: PromptKey, value: string) => void;
}> = ({ settings, onChange }) => (
  <div className="space-y-4">
    {promptGroups.map((group, index) => (
      <Accordion key={group.title} title={group.title} startOpen={index === 0}>
        <div className="space-y-6 pt-4">
          {group.keys.map((key) => (
            <div key={key}>
              <label className="block text-sm font-bold text-[var(--color-text-bright)] mb-1 uppercase tracking-wider">
                {key.replace(/_/g, " ").replace("SYSTEM INSTRUCTION", "")}
              </label>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                {promptDescriptions[key]}
              </p>
              <textarea
                value={settings.prompts[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full h-48 p-3 text-sm rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] text-[var(--color-text-default)] font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
          ))}
        </div>
      </Accordion>
    ))}
  </div>
);

// --- PROVIDERS TAB ---

const PasswordInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ value, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full p-3 text-sm rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] text-[var(--color-text-default)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] pr-10"
        placeholder="Enter API Key"
      />
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--color-text-muted)] hover:text-white"
      >
        {isVisible ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

const ApiKeyManager: React.FC = () => {
  const { settings, updateProvider } = useWorkflowStore((state) => ({
    settings: state.settings!,
    updateProvider: state.updateProvider,
  }));

  const googleProvider = settings.providers.find(
    (p) => p.id === "default-google",
  );

  if (!googleProvider) return null;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[var(--color-warning-bg)]/80 border border-[var(--color-warning-border)] text-xs text-[var(--color-warning-text)] rounded-md flex">
        <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <span>
          Your API key is stored securely in your browser's local storage and
          never sent to any server except Google's API.
        </span>
      </div>

      <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-panel-bg)]/50 space-y-4">
        <div>
          <h4 className="font-semibold text-white mb-1">Google Gemini API</h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            Manage your Google Gemini API key
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
            API Key
          </label>
          <PasswordInput
            value={googleProvider.apiKey}
            onChange={(e) =>
              updateProvider({ ...googleProvider, apiKey: e.target.value })
            }
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3 space-y-2">
          <p className="text-xs text-blue-200 font-semibold">
            Need an API key?
          </p>
          <p className="text-xs text-slate-300">
            Visit{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Google AI Studio
            </a>{" "}
            to create or manage your API keys.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MODELS TAB ---

const AI_TASK_DESCRIPTIONS: Record<
  AiTaskType,
  { title: string; description: string }
> = {
  categorize: {
    title: "Clinical Input Categorization",
    description:
      "Model for parsing raw text into a structured clinical brief. Requires high accuracy for JSON output.",
  },
  draftReport: {
    title: "Initial Report Draft",
    description:
      "Model for generating the first draft of the report from the clinical brief and a template.",
  },
  getGuidance: {
    title: "AI Clinical Guidance",
    description:
      "Model for providing study appropriateness checks. Uses Google Search if available.",
  },
  refineReport: {
    title: "Refine Report",
    description:
      "Model for improving the clarity, grammar, and conciseness of the report draft.",
  },
  integrateDictation: {
    title: "Integrate Dictation",
    description:
      "Model for intelligently merging dictated text into the existing report.",
  },
  finalReview: {
    title: "Final QA Review",
    description:
      "Model for performing the final quality assurance check, comparing the report to guidelines.",
  },
  applyRecommendations: {
    title: "Apply QA Recommendations",
    description:
      "Model for editing the report based on the suggestions from the final QA review.",
  },
  generateDifferentials: {
    title: "Generate Differentials",
    description:
      "Model for creating a list of differential diagnoses based on the report findings.",
  },
  synthesizeImpression: {
    title: "Synthesize Impression",
    description:
      "Model for writing the final impression by combining findings and selected differentials.",
  },
  answerQuery: {
    title: "Q/A Chat",
    description:
      "Model used for answering follow-up questions in the final review panel.",
  },
  // FIX: Add missing AI task description
  selectGuidelines: {
    title: "Select Clinical Guidelines",
    description:
      "Model for selecting relevant clinical guidelines from a knowledge base to compare against the report.",
  },
  generateImage: {
    title: "Generate Background Image",
    description: "Model for generating the dynamic background image.",
  },
};

const ModelsTab: React.FC<{
  settings: Settings;
  onActiveProviderChange: (id: string) => void;
  onModelChange: (
    providerId: string,
    assignments: Partial<ModelAssignment>,
  ) => void;
}> = ({ settings, onActiveProviderChange, onModelChange }) => {
  const [modelLists, setModelLists] = useState<Record<string, FetchedModel[]>>(
    {},
  );
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [errorStates, setErrorStates] = useState<Record<string, string | null>>(
    {},
  );

  const activeProvider = settings.providers.find(
    (p) => p.id === settings.activeProviderId,
  );
  const currentAssignments =
    settings.modelAssignments[settings.activeProviderId] ||
    ({} as ModelAssignment);

  const handleFetchModels = useCallback(async () => {
    if (!activeProvider) return;
    setLoadingStates((prev) => ({ ...prev, [activeProvider.id]: true }));
    setErrorStates((prev) => ({ ...prev, [activeProvider.id]: null }));
    try {
      const models = await fetchModels(activeProvider);
      setModelLists((prev) => ({ ...prev, [activeProvider.id]: models }));
      logEvent("Models fetched successfully", {
        provider: activeProvider.name,
        count: models.length,
      });
    } catch (e) {
      const error =
        e instanceof Error ? e.message : "An unknown error occurred";
      setErrorStates((prev) => ({ ...prev, [activeProvider.id]: error }));
      logError("Failed to fetch models", {
        provider: activeProvider.name,
        error,
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [activeProvider.id]: false }));
    }
  }, [activeProvider]);

  // Auto-fetch models when provider changes
  useEffect(() => {
    if (
      activeProvider &&
      !modelLists[activeProvider.id] &&
      !loadingStates[activeProvider.id] &&
      !errorStates[activeProvider.id]
    ) {
      handleFetchModels();
    }
  }, [
    activeProvider,
    handleFetchModels,
    modelLists,
    loadingStates,
    errorStates,
  ]);

  const handleModelInputChange = (task: AiTaskType, value: string) => {
    onModelChange(settings.activeProviderId, { [task]: value });
  };

  const handleTestBackground = async () => {
    try {
      // We can't easily call the service here without importing it, but we can use a simple alert for now
      // or better, trigger a re-render in App.tsx via store?
      // Actually, let's just notify the user to check the main screen.
      // Or, we can import the service.
      const { generateImpressionistBackground } = await import(
        "../services/geminiService"
      );
      const apiKey = activeProvider?.apiKey || "";
      if (!apiKey) {
        alert("Please set an API Key for this provider first.");
        return;
      }
      alert("Starting test generation... Check console for details.");
      const url = await generateImpressionistBackground(apiKey);
      if (url) {
        alert(
          "Success! Image generated. (See console or main background if updated)",
        );
        // Ideally we'd update the store, but let's just verify it works.
      }
    } catch (e) {
      alert(`Generation Failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const modelDatalistId = `models-for-${activeProvider?.id}`;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-[var(--color-text-bright)] mb-1 uppercase tracking-wider">
          Active API Provider
        </label>
        <p className="text-xs text-[var(--color-text-muted)] mb-2">
          Select which configured provider the application should use for AI
          tasks.
        </p>
        <select
          value={settings.activeProviderId}
          onChange={(e) => onActiveProviderChange(e.target.value)}
          className="w-full p-3 text-sm rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] text-[var(--color-text-default)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        >
          {settings.providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {activeProvider && (
        <div className="p-4 border border-[var(--color-border)] rounded-lg space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
            <h4 className="font-semibold text-white">
              Model Assignments for {activeProvider.name}
            </h4>
            <SecondaryButton
              onClick={handleFetchModels}
              disabled={loadingStates[activeProvider.id]}
            >
              {loadingStates[activeProvider.id] ? (
                <LoadingSpinner className="h-4 w-4 mr-2" />
              ) : null}
              Refresh Models
            </SecondaryButton>
          </div>

          {errorStates[activeProvider.id] && (
            <p className="text-xs text-[var(--color-danger-text)]">
              Error: {errorStates[activeProvider.id]}
            </p>
          )}

          <datalist id={modelDatalistId}>
            {(modelLists[activeProvider.id] || []).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </datalist>

          <div className="space-y-5">
            {Object.entries(AI_TASK_DESCRIPTIONS).map(([task, details]) => (
              <div key={task}>
                <label className="block text-sm font-semibold text-[var(--color-text-bright)]">
                  {details.title}
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                  {details.description}
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    list={modelDatalistId}
                    value={currentAssignments[task as AiTaskType] || ""}
                    onChange={(e) =>
                      handleModelInputChange(task as AiTaskType, e.target.value)
                    }
                    className="w-full p-3 text-sm rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] text-[var(--color-text-default)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="Enter model ID"
                  />
                  {task === "generateImage" &&
                    activeProvider.providerId === "google" && (
                      <SecondaryButton
                        onClick={handleTestBackground}
                        title="Test Generation"
                      >
                        Test
                      </SecondaryButton>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PANEL ---

type Tab = "prompts" | "providers" | "models" | "knowledge";

const SettingsPanel: React.FC = () => {
  const {
    isSettingsPanelOpen,
    toggleSettingsPanel,
    settings,
    updateSettings,
    resetSettings,
    setActiveProviderId,
    updateModelAssignment,
  } = useWorkflowStore((state) => ({
    isSettingsPanelOpen: state.isSettingsPanelOpen,
    toggleSettingsPanel: state.toggleSettingsPanel,
    settings: state.settings,
    updateSettings: state.updateSettings,
    resetSettings: state.resetSettings,
    setActiveProviderId: state.setActiveProviderId,
    updateModelAssignment: state.updateModelAssignment,
  }));

  const [activeTab, setActiveTab] = useState<Tab>("models");
  const [localSettings, setLocalSettings] = useState<Settings | null>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings, isSettingsPanelOpen]);

  if (!isSettingsPanelOpen || !localSettings) return null;

  const handleSettingsChange = (newSettingsData: Partial<Settings>) => {
    setLocalSettings((prev) => (prev ? { ...prev, ...newSettingsData } : null));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (localSettings) {
      updateSettings(localSettings);
      setHasChanges(false);
      toggleSettingsPanel();
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    toggleSettingsPanel();
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to their original defaults? This cannot be undone.",
      )
    ) {
      resetSettings();
    }
  };

  const tabClasses = (tabName: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-interactive-bg-hover)] hover:text-white"}`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={handleCancel}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[var(--color-base)]/80 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)] animate-slide-in-right">
        <header className="flex items-center justify-between p-4 border-b border-[var(--color-secondary)]/30 flex-shrink-0">
          <h2 className="text-lg font-semibold text-[var(--color-text-bright)]">
            Application Settings
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 rounded-full hover:bg-[var(--color-interactive-bg-hover)]"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex items-center space-x-2 p-4 border-b border-[var(--color-secondary)]/30 flex-shrink-0">
          <button
            onClick={() => setActiveTab("models")}
            className={tabClasses("models")}
          >
            AI Models
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={tabClasses("providers")}
          >
            API Key
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={tabClasses("prompts")}
          >
            System Prompts
          </button>
        </nav>

        <div className="flex-grow p-6 overflow-y-auto">
          {activeTab === "prompts" && (
            <PromptsTab
              settings={localSettings}
              onChange={(key, value) =>
                handleSettingsChange({
                  prompts: { ...localSettings.prompts, [key]: value },
                })
              }
            />
          )}
          {activeTab === "providers" && <ApiKeyManager />}
          {activeTab === "models" && (
            <ModelsTab
              settings={localSettings}
              onActiveProviderChange={setActiveProviderId}
              onModelChange={updateModelAssignment}
            />
          )}
        </div>

        <footer className="flex items-center justify-between p-4 border-t border-[var(--color-secondary)]/30 flex-shrink-0 bg-[var(--color-base)]/90">
          <SecondaryButton
            onClick={handleReset}
            className="text-[var(--color-danger-text)] border-[var(--color-danger-border)] hover:bg-[var(--color-danger-bg)] hover:text-white"
          >
            Reset All to Defaults
          </SecondaryButton>
          <div className="flex items-center space-x-3">
            <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
            <ActionButton onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </ActionButton>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SettingsPanel;
