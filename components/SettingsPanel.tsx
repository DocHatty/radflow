import React, { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "../App";
import ActionButton from "./ActionButton";
import SecondaryButton from "./SecondaryButton";
import Accordion from "./Accordion";
import { XIcon, TrashIcon, InfoIcon, EyeIcon, EyeSlashIcon } from "./Icons";
import {
  Settings,
  PromptKey,
  ProviderId,
  FetchedModel,
  ModelAssignment,
  AiTaskType,
} from "../types";
import { logError, logEvent } from "../services/loggingService";
import { fetchModels } from "../services/modelFetcherService";
import { validateProvider, getRecommendedModels } from "../services/providerValidationService";
import LoadingSpinner from "./LoadingSpinner";

// Check icon for validation success
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// X circle icon for validation failure
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Zap icon for auto-configure
const ZapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// --- PROMPTS TAB ---

const promptDescriptions: Partial<Record<PromptKey, string>> = {
  CATEGORIZATION_SYSTEM_INSTRUCTION:
    "Instructs the AI on how to parse raw clinical text into a structured JSON format. High precision is critical here.",
  INITIAL_DRAFT_SYSTEM_INSTRUCTION:
    "Guides the AI in creating the first report draft by combining a base template with the patient's clinical brief.",
  GUIDANCE_SYSTEM_INSTRUCTION:
    "Defines how the AI provides clinical guidance, forcing it to rely solely on grounded search results for appropriateness checks.",
  APPROPRIATENESS_SYSTEM_INSTRUCTION:
    "Instructs the AI on how to assess study appropriateness based on ACR criteria and clinical context.",
  DETAILED_GUIDANCE_SYSTEM_INSTRUCTION:
    "Provides detailed clinical guidance for specific findings and recommendations.",
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
  DIFFERENTIAL_REFINER_SYSTEM_INSTRUCTION:
    "Refines the differential diagnosis list based on additional findings or user input.",
  IMPRESSION_SYNTHESIZER_SYSTEM_INSTRUCTION:
    'Guides the AI in writing the final "Impression" section by synthesizing the brief, findings, and selected differentials.',
  QUERY_SYSTEM_INSTRUCTION:
    "The prompt for the Q/A chat, instructing the AI to answer questions based on the clinical context and report.",
  GUIDELINE_SELECTION_SYSTEM_INSTRUCTION:
    "Instructs the AI on how to select relevant clinical guidelines from a list based on the provided clinical brief.",
  RUNDOWN_MOST_LIKELY_INSTRUCTION:
    "Generates the most likely diagnosis section of the real-world rundown.",
  RUNDOWN_TOP_FACTS_INSTRUCTION: "Provides key clinical facts relevant to the case.",
  RUNDOWN_WHAT_TO_LOOK_FOR_INSTRUCTION: "Highlights specific imaging findings to look for.",
  RUNDOWN_PITFALLS_INSTRUCTION: "Identifies common diagnostic pitfalls to avoid.",
  RUNDOWN_SEARCH_PATTERN_INSTRUCTION: "Suggests a systematic search pattern for image review.",
  RUNDOWN_PERTINENT_NEGATIVES_INSTRUCTION: "Lists pertinent negative findings to document.",
  RUNDOWN_CLASSIC_SIGNS_INSTRUCTION:
    "Describes classic radiological signs associated with the case.",
  RUNDOWN_BOTTOM_LINE_INSTRUCTION: "Provides the bottom-line clinical takeaway.",
  RUNDOWN_APPROPRIATENESS_INSTRUCTION: "Assesses study appropriateness for the rundown section.",
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
              <label
                htmlFor={`prompt-${key}`}
                className="block text-sm font-bold text-(--color-text-bright) mb-1 uppercase tracking-wider"
              >
                {key.replace(/_/g, " ").replace("SYSTEM INSTRUCTION", "")}
              </label>
              <p className="text-xs text-(--color-text-muted) mb-2">{promptDescriptions[key]}</p>
              <textarea
                id={`prompt-${key}`}
                name={`prompt-${key}`}
                value={settings.prompts[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full h-48 p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) font-mono resize-y focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
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
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, value, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) font-mono focus:outline-none focus:ring-1 focus:ring-(--color-primary) pr-10"
        placeholder="Enter API Key"
      />
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-(--color-text-muted) hover:text-white"
      >
        {isVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
};

const ProvidersTab: React.FC = () => {
  const {
    settings,
    addProvider,
    updateProvider,
    removeProvider,
    setActiveProviderId,
    updateModelAssignment,
  } = useWorkflowStore((state) => ({
    settings: state.settings as Settings,
    addProvider: state.addProvider,
    updateProvider: state.updateProvider,
    removeProvider: state.removeProvider,
    setActiveProviderId: state.setActiveProviderId,
    updateModelAssignment: state.updateModelAssignment,
  }));

  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState<{
    providerId: ProviderId;
    name: string;
    apiKey: string;
    baseUrl: string;
  }>({
    providerId: "openai",
    name: "",
    apiKey: "",
    baseUrl: "",
  });

  // Validation state per provider
  const [validationStates, setValidationStates] = useState<
    Record<
      string,
      {
        status: "idle" | "validating" | "valid" | "invalid";
        message?: string;
        models?: FetchedModel[];
        latencyMs?: number;
      }
    >
  >({});

  // Handle validation for a provider
  const handleValidateProvider = useCallback(
    async (provider: (typeof settings.providers)[0]) => {
      setValidationStates((prev) => ({
        ...prev,
        [provider.id]: { status: "validating" },
      }));

      try {
        const result = await validateProvider(provider);
        setValidationStates((prev) => ({
          ...prev,
          [provider.id]: {
            status: result.isValid ? "valid" : "invalid",
            message: result.message,
            models: result.models,
            latencyMs: result.latencyMs,
          },
        }));

        // If valid and has models, offer to auto-configure
        if (result.isValid && result.models && result.models.length > 0) {
          logEvent("Provider validated with models", {
            providerId: provider.providerId,
            modelCount: result.models.length,
          });
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Validation failed";
        setValidationStates((prev) => ({
          ...prev,
          [provider.id]: { status: "invalid", message },
        }));
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.providers]
  );

  // Auto-configure models for a provider
  const handleAutoConfigure = useCallback(
    async (provider: (typeof settings.providers)[0]) => {
      const validation = validationStates[provider.id];

      // If not validated yet, validate first
      let models = validation?.models;
      if (!models || validation?.status !== "valid") {
        const result = await handleValidateProvider(provider);
        if (!result?.isValid || !result.models) {
          return;
        }
        models = result.models;
      }

      // Get recommended model assignments
      const recommendations = getRecommendedModels(provider.providerId, models);

      // Apply all recommendations
      Object.entries(recommendations).forEach(([task, modelId]) => {
        updateModelAssignment(provider.id, { [task]: modelId });
      });

      // Set as active provider
      setActiveProviderId(provider.id);

      logEvent("Provider auto-configured", {
        providerId: provider.providerId,
        tasksConfigured: Object.keys(recommendations).length,
      });

      alert(
        `Auto-configured ${Object.keys(recommendations).length} task assignments for ${provider.name}!`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validationStates, handleValidateProvider, updateModelAssignment, setActiveProviderId]
  );

  const providerInfo: Record<ProviderId, { name: string; url: string; defaultBaseUrl?: string }> = {
    google: { name: "Google Gemini", url: "https://aistudio.google.com/apikey" },
    openai: {
      name: "OpenAI",
      url: "https://platform.openai.com/api-keys",
      defaultBaseUrl: "https://api.openai.com/v1",
    },
    anthropic: {
      name: "Anthropic Claude",
      url: "https://console.anthropic.com/",
      defaultBaseUrl: "https://api.anthropic.com/v1",
    },
    openrouter: {
      name: "OpenRouter",
      url: "https://openrouter.ai/keys",
      defaultBaseUrl: "https://openrouter.ai/api/v1",
    },
    perplexity: {
      name: "Perplexity",
      url: "https://www.perplexity.ai/settings/api",
      defaultBaseUrl: "https://api.perplexity.ai",
    },
  };

  const handleAddProvider = () => {
    if (!newProvider.apiKey.trim()) {
      alert("Please enter an API key");
      return;
    }

    const providerName = newProvider.name.trim() || providerInfo[newProvider.providerId].name;

    addProvider({
      providerId: newProvider.providerId,
      name: providerName,
      apiKey: newProvider.apiKey.trim(),
      baseUrl:
        newProvider.baseUrl.trim() || providerInfo[newProvider.providerId].defaultBaseUrl || "",
    });

    setShowAddProvider(false);
    setNewProvider({
      providerId: "openai",
      name: "",
      apiKey: "",
      baseUrl: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-(--color-warning-bg)/80 border border-(--color-warning-border) text-xs text-(--color-warning-text) rounded-md flex">
        <InfoIcon className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
        <span>
          Your API keys are stored securely in your browser's local storage and only sent to the
          respective provider's API.
        </span>
      </div>

      {/* Existing Providers */}
      <div className="space-y-3">
        {settings.providers.map((provider) => {
          const info = providerInfo[provider.providerId];
          const isDefault = provider.id === "default-google";
          const isActive = provider.id === settings.activeProviderId;

          return (
            <div
              key={provider.id}
              className={`p-4 border rounded-lg bg-(--color-panel-bg)/50 space-y-3 ${
                isActive ? "border-(--color-primary)" : "border-(--color-border)"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{provider.name}</h4>
                    {isActive && (
                      <span className="px-2 py-0.5 text-xs bg-(--color-primary)/20 text-(--color-primary) rounded">
                        Active
                      </span>
                    )}
                    {isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-(--color-text-muted)">{info.name} Provider</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      onClick={() => setActiveProviderId(provider.id)}
                      className="px-3 py-1 text-xs bg-(--color-primary)/10 text-(--color-primary) hover:bg-(--color-primary)/20 rounded"
                    >
                      Set Active
                    </button>
                  )}
                  {!isDefault && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove provider "${provider.name}"?`)) {
                          removeProvider(provider.id);
                        }
                      }}
                      className="p-1 text-(--color-danger-text) hover:bg-(--color-danger-bg)/20 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor={`apikey-${provider.id}`}
                  className="block text-sm font-semibold text-(--color-text-muted) mb-2"
                >
                  API Key
                </label>
                <PasswordInput
                  id={`apikey-${provider.id}`}
                  value={provider.apiKey}
                  onChange={(e) => updateProvider({ ...provider, apiKey: e.target.value })}
                />
              </div>

              {provider.baseUrl && (
                <div>
                  <label
                    htmlFor={`baseurl-${provider.id}`}
                    className="block text-sm font-semibold text-(--color-text-muted) mb-2"
                  >
                    Base URL (Optional)
                  </label>
                  <input
                    id={`baseurl-${provider.id}`}
                    name={`baseurl-${provider.id}`}
                    type="text"
                    value={provider.baseUrl}
                    onChange={(e) => updateProvider({ ...provider, baseUrl: e.target.value })}
                    className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) font-mono focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                    placeholder={info.defaultBaseUrl}
                  />
                </div>
              )}

              {/* Validation Status & Actions */}
              {provider.apiKey && (
                <div className="flex flex-col gap-2">
                  {/* Validation Status */}
                  {validationStates[provider.id] && (
                    <div
                      className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                        validationStates[provider.id].status === "valid"
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : validationStates[provider.id].status === "invalid"
                            ? "bg-red-500/10 border border-red-500/30 text-red-400"
                            : validationStates[provider.id].status === "validating"
                              ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                              : ""
                      }`}
                    >
                      {validationStates[provider.id].status === "validating" && (
                        <LoadingSpinner className="h-4 w-4" />
                      )}
                      {validationStates[provider.id].status === "valid" && (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      {validationStates[provider.id].status === "invalid" && (
                        <XCircleIcon className="h-4 w-4" />
                      )}
                      <span className="flex-1">{validationStates[provider.id].message}</span>
                      {validationStates[provider.id].latencyMs && (
                        <span className="text-xs opacity-60">
                          {validationStates[provider.id].latencyMs}ms
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidateProvider(provider)}
                      disabled={validationStates[provider.id]?.status === "validating"}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md bg-(--color-interactive-bg) hover:bg-(--color-interactive-bg-hover) text-(--color-text-default) border border-(--color-border) disabled:opacity-50 transition-colors"
                    >
                      {validationStates[provider.id]?.status === "validating" ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      Test Connection
                    </button>
                    <button
                      onClick={() => handleAutoConfigure(provider)}
                      disabled={validationStates[provider.id]?.status === "validating"}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-50 transition-colors"
                      title="Validate API key, fetch models, and auto-assign to all tasks"
                    >
                      <ZapIcon className="h-4 w-4" />
                      Auto-Configure
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <p className="text-xs text-slate-300">
                  Get API key:{" "}
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    {info.url}
                  </a>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Provider Button/Form */}
      {!showAddProvider ? (
        <button
          onClick={() => setShowAddProvider(true)}
          className="w-full p-4 border border-dashed border-(--color-border) rounded-lg text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary) hover:bg-(--color-primary)/5 transition-colors"
        >
          + Add Another Provider
        </button>
      ) : (
        <div className="p-4 border border-(--color-primary) rounded-lg bg-(--color-panel-bg)/50 space-y-4">
          <h4 className="font-semibold text-white">Add New Provider</h4>

          <div>
            <label
              htmlFor="new-provider-type"
              className="block text-sm font-semibold text-(--color-text-muted) mb-2"
            >
              Provider Type
            </label>
            <select
              id="new-provider-type"
              name="new-provider-type"
              value={newProvider.providerId}
              onChange={(e) =>
                setNewProvider({
                  ...newProvider,
                  providerId: e.target.value as ProviderId,
                  name: "",
                  baseUrl: providerInfo[e.target.value as ProviderId].defaultBaseUrl || "",
                })
              }
              className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="openrouter">OpenRouter</option>
              <option value="perplexity">Perplexity</option>
              <option value="google">Google Gemini (Additional)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="new-provider-name"
              className="block text-sm font-semibold text-(--color-text-muted) mb-2"
            >
              Name (Optional)
            </label>
            <input
              id="new-provider-name"
              name="new-provider-name"
              type="text"
              value={newProvider.name}
              onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
              className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              placeholder={`My ${providerInfo[newProvider.providerId].name}`}
            />
          </div>

          <div>
            <label
              htmlFor="new-provider-apikey"
              className="block text-sm font-semibold text-(--color-text-muted) mb-2"
            >
              API Key *
            </label>
            <PasswordInput
              id="new-provider-apikey"
              value={newProvider.apiKey}
              onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
            />
          </div>

          <div>
            <label
              htmlFor="new-provider-baseurl"
              className="block text-sm font-semibold text-(--color-text-muted) mb-2"
            >
              Base URL (Optional)
            </label>
            <input
              id="new-provider-baseurl"
              name="new-provider-baseurl"
              type="text"
              value={newProvider.baseUrl}
              onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
              className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) font-mono focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              placeholder={providerInfo[newProvider.providerId].defaultBaseUrl || "https://..."}
            />
            <p className="text-xs text-(--color-text-muted) mt-1">
              Leave empty to use default. Useful for proxies or self-hosted endpoints.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddProvider}
              className="flex-1 px-4 py-2 bg-(--color-primary) text-white rounded-md hover:bg-(--color-primary)/80 font-semibold"
            >
              Add Provider
            </button>
            <button
              onClick={() => {
                setShowAddProvider(false);
                setNewProvider({
                  providerId: "openai",
                  name: "",
                  apiKey: "",
                  baseUrl: "",
                });
              }}
              className="flex-1 px-4 py-2 bg-(--color-interactive-bg) text-(--color-text-default) rounded-md hover:bg-(--color-interactive-bg-hover) font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
            <p className="text-xs text-slate-300">
              Get API key:{" "}
              <a
                href={providerInfo[newProvider.providerId].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {providerInfo[newProvider.providerId].url}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Provider-Specific Features Note */}
      <div className="p-3 bg-(--color-info-bg)/80 border border-(--color-info-border) rounded-md">
        <p className="text-xs text-(--color-info-text) font-semibold mb-1">
          Provider-Specific Features:
        </p>
        <ul className="text-xs text-(--color-info-text) space-y-1 ml-4 list-disc">
          <li>Grounding (web search): Google Gemini only</li>
          <li>Image generation: Google Gemini with Imagen models only</li>
          <li>All providers support text generation tasks</li>
        </ul>
      </div>
    </div>
  );
};

// --- MODELS TAB ---

const AI_TASK_DESCRIPTIONS: Record<AiTaskType, { title: string; description: string }> = {
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
    description: "Model for improving the clarity, grammar, and conciseness of the report draft.",
  },
  integrateDictation: {
    title: "Integrate Dictation",
    description: "Model for intelligently merging dictated text into the existing report.",
  },
  finalReview: {
    title: "Final QA Review",
    description:
      "Model for performing the final quality assurance check, comparing the report to guidelines.",
  },
  applyRecommendations: {
    title: "Apply QA Recommendations",
    description: "Model for editing the report based on the suggestions from the final QA review.",
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
    description: "Model used for answering follow-up questions in the final review panel.",
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
  getAppropriateness: {
    title: "Appropriateness Evaluation",
    description: "Model for evaluating study appropriateness against ACR criteria.",
  },
  getDetailedGuidance: {
    title: "Detailed Clinical Guidance",
    description: "Model for generating comprehensive real-world rundown guidance.",
  },
  refineDifferentials: {
    title: "Refine Differentials",
    description: "Model for updating differential diagnoses based on new findings.",
  },
  rundownAppropriateness: {
    title: "Rundown: Appropriateness",
    description: "Quick appropriateness check for the study.",
  },
  rundownMostLikely: {
    title: "Rundown: Most Likely Diagnoses",
    description: "Predict the most probable outcomes for the study.",
  },
  rundownTopFacts: {
    title: "Rundown: Top Facts",
    description: "High-yield clinical pearls for this case.",
  },
  rundownWhatToLookFor: {
    title: "Rundown: What to Look For",
    description: "Critical findings to actively search for.",
  },
  rundownPitfalls: {
    title: "Rundown: Pitfalls & Mimics",
    description: "Common mistakes and look-alikes to avoid.",
  },
  rundownSearchPattern: {
    title: "Rundown: Search Pattern",
    description: "Systematic approach to reviewing the images.",
  },
  rundownPertinentNegatives: {
    title: "Rundown: Pertinent Negatives",
    description: "Important negatives that answer clinical questions.",
  },
  rundownClassicSigns: {
    title: "Rundown: Classic Signs",
    description: "Pathognomonic features to confirm diagnoses.",
  },
  rundownBottomLine: {
    title: "Rundown: Bottom Line",
    description: "The single most important takeaway for this case.",
  },
};

const ModelsTab: React.FC = () => {
  // Use store directly so we see providers added in ProvidersTab immediately
  const { settings, setActiveProviderId, updateModelAssignment } = useWorkflowStore((state) => ({
    settings: state.settings as Settings,
    setActiveProviderId: state.setActiveProviderId,
    updateModelAssignment: state.updateModelAssignment,
  }));

  const [modelLists, setModelLists] = useState<Record<string, FetchedModel[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, string | null>>({});

  const activeProvider = settings.providers.find((p) => p.id === settings.activeProviderId);
  const currentAssignments =
    settings.modelAssignments[settings.activeProviderId] || ({} as ModelAssignment);

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
      const error = e instanceof Error ? e.message : "An unknown error occurred";
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
  }, [activeProvider, handleFetchModels, modelLists, loadingStates, errorStates]);

  const handleModelInputChange = (task: AiTaskType, value: string) => {
    updateModelAssignment(settings.activeProviderId, { [task]: value });
  };

  const handleTestBackground = async () => {
    try {
      // We can't easily call the service here without importing it, but we can use a simple alert for now
      // or better, trigger a re-render in App.tsx via store?
      // Actually, let's just notify the user to check the main screen.
      // Or, we can import the service.
      const { generateImpressionistBackground } = await import("../services/geminiService");
      const apiKey = activeProvider?.apiKey || "";
      if (!apiKey) {
        alert("Please set an API Key for this provider first.");
        return;
      }
      alert("Starting test generation... Check console for details.");
      const url = await generateImpressionistBackground(apiKey);
      if (url) {
        alert("Success! Image generated. (See console or main background if updated)");
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
        <label
          htmlFor="active-provider-select"
          className="block text-sm font-bold text-(--color-text-bright) mb-1 uppercase tracking-wider"
        >
          Active API Provider
        </label>
        <p className="text-xs text-(--color-text-muted) mb-2">
          Select which configured provider the application should use for AI tasks.
        </p>
        <select
          id="active-provider-select"
          name="active-provider-select"
          value={settings.activeProviderId}
          onChange={(e) => setActiveProviderId(e.target.value)}
          className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
        >
          {settings.providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {activeProvider && (
        <div className="p-4 border border-(--color-border) rounded-lg space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-(--color-border)">
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
            <p className="text-xs text-(--color-danger-text)">
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
                <label
                  htmlFor={`model-${task}`}
                  className="block text-sm font-semibold text-(--color-text-bright)"
                >
                  {details.title}
                </label>
                <p className="text-xs text-(--color-text-muted) mb-1.5">{details.description}</p>
                <div className="flex space-x-2">
                  <input
                    id={`model-${task}`}
                    name={`model-${task}`}
                    type="text"
                    list={modelDatalistId}
                    value={currentAssignments[task as AiTaskType] || ""}
                    onChange={(e) => handleModelInputChange(task as AiTaskType, e.target.value)}
                    className="w-full p-3 text-sm rounded-md bg-(--color-input-bg) border border-(--color-border) focus:border-(--color-primary) text-(--color-text-default) font-mono focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                    placeholder="Enter model ID"
                  />
                  {task === "generateImage" && activeProvider.providerId === "google" && (
                    <SecondaryButton onClick={handleTestBackground} title="Test Generation">
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
        "Are you sure you want to reset all settings to their original defaults? This cannot be undone."
      )
    ) {
      resetSettings();
    }
  };

  const tabClasses = (tabName: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? "bg-(--color-primary)/20 text-(--color-primary)" : "text-(--color-text-muted) hover:bg-(--color-interactive-bg-hover) hover:text-white"}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={handleCancel} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-(--color-base)/80 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-(--color-border) animate-slide-in-right">
        <header className="flex items-center justify-between p-4 border-b border-(--color-secondary)/30 shrink-0">
          <h2 className="text-lg font-semibold text-(--color-text-bright)">Application Settings</h2>
          <button
            onClick={handleCancel}
            className="p-1 rounded-full hover:bg-(--color-interactive-bg-hover)"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex items-center space-x-2 p-4 border-b border-(--color-secondary)/30 shrink-0">
          <button onClick={() => setActiveTab("models")} className={tabClasses("models")}>
            AI Models
          </button>
          <button onClick={() => setActiveTab("providers")} className={tabClasses("providers")}>
            Providers
          </button>
          <button onClick={() => setActiveTab("prompts")} className={tabClasses("prompts")}>
            System Prompts
          </button>
        </nav>

        <div className="grow p-6 overflow-y-auto">
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
          {activeTab === "providers" && <ProvidersTab />}
          {activeTab === "models" && <ModelsTab />}
        </div>

        <footer className="flex items-center justify-between p-4 border-t border-(--color-secondary)/30 shrink-0 bg-(--color-base)/90">
          <SecondaryButton
            onClick={handleReset}
            className="text-(--color-danger-text) border-(--color-danger-border) hover:bg-(--color-danger-bg) hover:text-white"
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
