import { StateCreator } from "zustand";
import { logEvent, logError } from "../services/loggingService";
import { DEFAULT_SETTINGS } from "../settings/defaults";
import type { Settings, ApiProvider, ModelAssignment, AiTaskType } from "../types";
import { WorkflowSlice } from "./createWorkflowSlice";

const SETTINGS_STORAGE_KEY = "radflow-settings";
const FIRST_LAUNCH_KEY = "radflow-first-launch";

// --- STATE SLICE INTERFACE ---
export interface SettingsSlice {
  settings: Settings | null;
  defaultSettings: Settings;
  isSettingsPanelOpen: boolean;
  availableModels: Record<string, string[]>; // Map of providerId -> list of model IDs
  needsApiKeySetup: boolean;

  // Actions
  _loadSettings: () => void;
  _saveSettings: (settings: Settings) => void;
  updateSettings: (newSettings: Settings) => void;
  resetSettings: () => void;
  toggleSettingsPanel: () => void;
  setAvailableModels: (providerId: string, models: string[]) => void;
  completeApiKeySetup: (apiKey: string) => void;

  // New provider actions
  addProvider: (provider: Omit<ApiProvider, "id">) => void;
  updateProvider: (provider: ApiProvider) => void;
  removeProvider: (providerId: string) => void;
  setActiveProviderId: (providerId: string) => void;
  updateModelAssignment: (providerId: string, assignments: Partial<ModelAssignment>) => void;
}

// --- SLICE CREATOR FUNCTION ---
export const createSettingsSlice: StateCreator<
  WorkflowSlice & SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  settings: null,
  defaultSettings: DEFAULT_SETTINGS,
  isSettingsPanelOpen: false,
  availableModels: {},
  needsApiKeySetup: false,

  setAvailableModels: (providerId, models) =>
    set((state) => ({
      availableModels: {
        ...state.availableModels,
        [providerId]: models,
      },
    })),

  _loadSettings: () => {
    // Check both new and old first launch keys for backwards compatibility
    const hasLaunchedBefore =
      localStorage.getItem(FIRST_LAUNCH_KEY) ||
      localStorage.getItem("radiology-ai-assistant-first-launch");

    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // More robust validation for the new structure
        if (
          parsed.prompts &&
          parsed.providers &&
          parsed.activeProviderId &&
          parsed.modelAssignments
        ) {
          // Ensure default provider is always present and non-deletable
          const defaultProvider = DEFAULT_SETTINGS.providers[0];
          const hasDefault = parsed.providers.some((p: ApiProvider) => p.id === defaultProvider.id);
          if (!hasDefault) {
            parsed.providers.unshift(defaultProvider);
          }

          // CRITICAL FIX: Force update specific prompts that have been changed in the codebase
          // This ensures users get the new "Senior Radiologist" logic without clearing all settings.
          if (parsed.prompts) {
            parsed.prompts.GUIDANCE_SYSTEM_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.GUIDANCE_SYSTEM_INSTRUCTION;
            parsed.prompts.APPROPRIATENESS_SYSTEM_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.APPROPRIATENESS_SYSTEM_INSTRUCTION;
            parsed.prompts.DETAILED_GUIDANCE_SYSTEM_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.DETAILED_GUIDANCE_SYSTEM_INSTRUCTION;
            // Force update ALL rundown prompts to use new concise format
            parsed.prompts.RUNDOWN_APPROPRIATENESS_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_APPROPRIATENESS_INSTRUCTION;
            parsed.prompts.RUNDOWN_MOST_LIKELY_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_MOST_LIKELY_INSTRUCTION;
            parsed.prompts.RUNDOWN_TOP_FACTS_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_TOP_FACTS_INSTRUCTION;
            parsed.prompts.RUNDOWN_WHAT_TO_LOOK_FOR_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_WHAT_TO_LOOK_FOR_INSTRUCTION;
            parsed.prompts.RUNDOWN_PITFALLS_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_PITFALLS_INSTRUCTION;
            parsed.prompts.RUNDOWN_SEARCH_PATTERN_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_SEARCH_PATTERN_INSTRUCTION;
            parsed.prompts.RUNDOWN_PERTINENT_NEGATIVES_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_PERTINENT_NEGATIVES_INSTRUCTION;
            parsed.prompts.RUNDOWN_CLASSIC_SIGNS_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_CLASSIC_SIGNS_INSTRUCTION;
            parsed.prompts.RUNDOWN_BOTTOM_LINE_INSTRUCTION =
              DEFAULT_SETTINGS.prompts.RUNDOWN_BOTTOM_LINE_INSTRUCTION;
          }

          // CRITICAL FIX: Merge new model assignments (e.g. getAppropriateness)
          if (parsed.modelAssignments) {
            Object.keys(parsed.modelAssignments).forEach((providerKey) => {
              const assignments = parsed.modelAssignments[providerKey];
              const defaultAssignments =
                DEFAULT_SETTINGS.modelAssignments[DEFAULT_SETTINGS.providers[0].id];

              // Add any missing keys from default assignments
              Object.keys(defaultAssignments).forEach((taskKey) => {
                if (!assignments[taskKey as AiTaskType]) {
                  assignments[taskKey as AiTaskType] = defaultAssignments[taskKey as AiTaskType];
                }
              });
            });
          }

          set({ settings: parsed });
          logEvent("Settings loaded from localStorage");

          // Check if API key is set for default provider
          if (!defaultProvider?.apiKey && !hasLaunchedBefore) {
            set({ needsApiKeySetup: true });
          }
          return;
        }
      }
    } catch (error) {
      logError("Failed to load settings from localStorage", { error });
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }

    // First time setup - no settings saved yet
    if (!hasLaunchedBefore) {
      set({ settings: DEFAULT_SETTINGS, needsApiKeySetup: true });
      logEvent("First launch - API key setup needed");
    } else {
      set({ settings: DEFAULT_SETTINGS });
      logEvent("Loaded default settings");
    }
  },

  _saveSettings: (settingsToSave) => {
    // Use requestIdleCallback to defer localStorage writes to avoid blocking UI
    const saveOperation = () => {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
        logEvent("Settings saved to localStorage");
      } catch (error) {
        logError("Failed to save settings to localStorage", { error });
      }
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(saveOperation, { timeout: 1000 });
    } else {
      setTimeout(saveOperation, 0);
    }
  },

  updateSettings: (newSettings) => {
    set({ settings: newSettings });
    get()._saveSettings(newSettings);
  },

  resetSettings: () => {
    logEvent("Settings reset to default");
    set({ settings: DEFAULT_SETTINGS });
    get()._saveSettings(DEFAULT_SETTINGS);
  },

  toggleSettingsPanel: () =>
    set((state) => {
      const isOpen = !state.isSettingsPanelOpen;
      logEvent("Settings Panel Toggled", { isOpen });
      return { isSettingsPanelOpen: isOpen };
    }),

  completeApiKeySetup: (apiKey) => {
    const state = get();
    if (!state.settings) return;

    // Update the default Google provider with the API key
    const defaultProviderId = DEFAULT_SETTINGS.providers[0].id;
    const updatedProviders = state.settings.providers.map((p) =>
      p.id === defaultProviderId ? { ...p, apiKey } : p
    );

    const newSettings = {
      ...state.settings,
      providers: updatedProviders,
    };

    // Mark first launch as complete and save settings
    localStorage.setItem(FIRST_LAUNCH_KEY, "true");
    set({
      settings: newSettings,
      needsApiKeySetup: false,
    });
    get()._saveSettings(newSettings);
    logEvent("API key setup completed");
  },

  addProvider: (providerData) =>
    set((state) => {
      if (!state.settings) return {};
      const newProvider: ApiProvider = {
        ...providerData,
        id: `provider_${Date.now()}`,
      };
      const newProviders = [...state.settings.providers, newProvider];

      // Add a default model assignment for the new provider, copying from the default Google provider
      const newModelAssignments = {
        ...state.settings.modelAssignments,
        [newProvider.id]: {
          ...DEFAULT_SETTINGS.modelAssignments[DEFAULT_SETTINGS.providers[0].id],
        },
      };

      const newSettings: Settings = {
        ...state.settings,
        providers: newProviders,
        modelAssignments: newModelAssignments,
      };
      get()._saveSettings(newSettings);
      return { settings: newSettings };
    }),

  updateProvider: (updatedProvider) =>
    set((state) => {
      if (!state.settings) return {};
      const newProviders = state.settings.providers.map((p) =>
        p.id === updatedProvider.id ? updatedProvider : p
      );
      const newSettings = { ...state.settings, providers: newProviders };
      get()._saveSettings(newSettings);
      return { settings: newSettings };
    }),

  removeProvider: (providerIdToRemove) =>
    set((state) => {
      if (!state.settings || providerIdToRemove === DEFAULT_SETTINGS.providers[0].id) return {}; // Prevent deleting default

      const newProviders = state.settings.providers.filter((p) => p.id !== providerIdToRemove);
      const newAssignments = { ...state.settings.modelAssignments };
      delete newAssignments[providerIdToRemove];

      const newActiveProviderId =
        state.settings.activeProviderId === providerIdToRemove
          ? DEFAULT_SETTINGS.providers[0].id
          : state.settings.activeProviderId;

      const newSettings = {
        ...state.settings,
        providers: newProviders,
        modelAssignments: newAssignments,
        activeProviderId: newActiveProviderId,
      };
      get()._saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setActiveProviderId: (providerId) =>
    set((state) => {
      if (!state.settings) return {};
      const newSettings = { ...state.settings, activeProviderId: providerId };
      get()._saveSettings(newSettings);
      return { settings: newSettings };
    }),

  updateModelAssignment: (providerId, assignments) =>
    set((state) => {
      if (!state.settings) return {};

      // Fallback to default assignments if specific provider assignments don't exist
      // This ensures we always have a full ModelAssignment object, satisfying the type definition
      const defaultAssignments =
        DEFAULT_SETTINGS.modelAssignments[DEFAULT_SETTINGS.providers[0].id];
      const existingAssignments = state.settings.modelAssignments[providerId] || defaultAssignments;

      const newModelAssignments = {
        ...state.settings.modelAssignments,
        [providerId]: {
          ...existingAssignments,
          ...assignments,
        },
      };
      const newSettings = {
        ...state.settings,
        modelAssignments: newModelAssignments,
      };
      get()._saveSettings(newSettings);
      return { settings: newSettings };
    }),
});
