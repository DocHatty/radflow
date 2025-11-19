import React, { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { motion, AnimatePresence } from "framer-motion";

import Header from "./components/Header";
import WorkflowStepper from "./components/WorkflowStepper";
import InputStage from "./components/stages/InputStage";
import VerificationStage from "./components/stages/VerificationStage";
import SubmittedStage from "./components/stages/SubmittedStage";
import ErrorDisplay from "./components/ErrorDisplay";
import SettingsPanel from "./components/SettingsPanel";
import DiagnosticsPanel from "./components/DiagnosticsPanel";
import ApiKeySetupModal from "./components/ApiKeySetupModal";
import { useThemeManager } from "./hooks/useThemeManager";
import {
  createWorkflowSlice,
  WorkflowSlice,
} from "./store/createWorkflowSlice";
import {
  createSettingsSlice,
  SettingsSlice,
} from "./store/createSettingsSlice";
import { logEvent } from "./services/loggingService";
import { generateImpressionistBackground } from "./services/geminiService";

// --- CLEAR CACHE ON SESSION START (BEFORE STORE CREATION) ---
// This ensures every session starts with a fresh report
// API key is preserved in "radflow-settings" storage
try {
  localStorage.removeItem("radflow-workflow-storage");
  console.log("✨ Session start: Workflow cache cleared for fresh session");
} catch (e) {
  console.error("Error clearing workflow cache on session start:", e);
}

// --- ZUSTAND STORE DEFINITION ---
export const useWorkflowStore = create<WorkflowSlice & SettingsSlice>()(
  persist(
    (...a) => ({
      ...createWorkflowSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: "radflow-workflow-storage",
      partialize: (state) => ({
        // Persist workflow state
        workflowStage: state.workflowStage,
        parsedInfo: state.parsedInfo,
        editableReportContent: state.editableReportContent,
        differentials: state.differentials,
        selectedDifferentials: state.selectedDifferentials,
      }),
    },
  ),
);

// --- PARTICLE SYSTEM COMPONENT ---
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: {
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;
    }[] = [];
    const particleCount = 60; // Slightly reduced count for "orb" feel

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1, // Larger "orbs"
        speed: Math.random() * 0.15 + 0.05, // Slow float
        opacity: Math.random() * 0.3 + 0.05, // Subtle opacity
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Move up
        p.y -= p.speed;
        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Soft white/blue glow
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
};

// --- DYNAMIC BACKGROUND GENERATOR ---
import { fetchModels } from "./services/modelFetcherService";

const DynamicBackground: React.FC = () => {
  const BACKGROUND_STORAGE_KEY = "radflow-background-cache";

  // Try to load cached background on mount
  const [bgUrl, setBgUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(BACKGROUND_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [animationDuration, setAnimationDuration] = useState("60s");
  const [bgStatus, setBgStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");

  const { isAiReady, settings, setAvailableModels, availableModels } =
    useWorkflowStore((state) => ({
      isAiReady: state.isAiReady,
      settings: state.settings,
      setAvailableModels: state.setAvailableModels,
      availableModels: state.availableModels,
    }));

  // Fetch models on init or provider change
  useEffect(() => {
    const fetchAndStoreModels = async () => {
      const activeProvider = settings?.providers.find(
        (p) => p.id === settings.activeProviderId,
      );
      if (activeProvider && activeProvider.providerId === "google") {
        // Only fetch if not already fetched or if we want to ensure freshness (user requested "always ping")
        // User said "always ping at the beginning", so let's do it.
        try {
          const models = await fetchModels(activeProvider);
          setAvailableModels(
            activeProvider.id,
            models.map((m) => m.id),
          );
        } catch (e) {
          console.error("Failed to auto-fetch models on init", e);
        }
      }
    };

    if (settings?.activeProviderId) {
      fetchAndStoreModels();
    }
  }, [settings?.activeProviderId]); // Depend on active provider ID

  useEffect(() => {
    // Randomize animation duration between 45s and 85s
    const duration = Math.floor(Math.random() * (85 - 45 + 1)) + 45;
    setAnimationDuration(`${duration} s`);

    if (!isAiReady || bgUrl) return;

    const generateBg = async () => {
      setBgStatus("generating");
      try {
        // Get API key from store (assuming Google provider is available/active)
        const activeProvider = settings.providers.find(
          (p) => p.id === settings.activeProviderId,
        );
        const googleProvider =
          activeProvider?.providerId === "google"
            ? activeProvider
            : settings.providers.find((p) => p.providerId === "google");

        const apiKey = googleProvider?.apiKey || process.env.API_KEY;

        // Even if no API key, we call the service to get a fallback image
        const providerIdForModels = googleProvider?.id;
        const modelsList = providerIdForModels
          ? availableModels?.[providerIdForModels]
          : undefined;

        const url = await generateImpressionistBackground(apiKey, modelsList);
        setBgUrl(url);
        // Cache the background in localStorage
        try {
          localStorage.setItem(BACKGROUND_STORAGE_KEY, url);
        } catch (e) {
          console.warn("Failed to cache background:", e);
        }
        setBgStatus("success");
      } catch (e) {
        console.error("Background generation failed.", e);
        setBgStatus("error");
      }
    };

    // Small delay to ensure provider is fully loaded
    setTimeout(generateBg, 1000);
  }, [isAiReady]); // Re-run if AI becomes ready (which happens after settings load)

  return (
    <div className="fixed inset-0 z-[-2] bg-slate-950 overflow-hidden">
      {/* Generated Image with Ken Burns Effect */}
      <AnimatePresence>
        {bgUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
            className="absolute inset-0 animate-ken-burns"
            style={{
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              animationDuration: animationDuration, // Apply random duration
            }}
          />
        )}
      </AnimatePresence>
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />

      {/* Status Indicator */}
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-500/50 font-mono pointer-events-none z-0">
        {bgStatus === "generating" && (
          <span className="animate-pulse">Generating Background Art...</span>
        )}
        {bgStatus === "error" && (
          <span className="text-red-500/50">Background Generation Failed</span>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
import { Loader2, Database } from "lucide-react";

// ... (existing imports)

// ... (inside App component)
function App() {
  const {
    workflowStage,
    init,
    isInitializing,
    needsApiKeySetup,
    completeApiKeySetup,
  } = useWorkflowStore((state) => ({
    workflowStage: state.workflowStage,
    init: state.init,
    isInitializing: state.isInitializing,
    needsApiKeySetup: state.needsApiKeySetup,
    completeApiKeySetup: state.completeApiKeySetup,
  }));
  const { changeTheme } = useThemeManager();

  useEffect(() => {
    init();
  }, [init]);

  // Auto-clear cache on session close (preserving API key)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Clear workflow storage (reports, parsed info, etc.)
        localStorage.removeItem("radflow-workflow-storage");

        // Clear diagnostics and session state but preserve settings (including API key)
        // Settings are stored separately in "radflow-settings" and managed by createSettingsSlice

        logEvent("Session cleanup: Cache cleared on window close");
      } catch (error) {
        console.error("Error during session cleanup:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-sm font-medium text-slate-200">
      <DynamicBackground />

      <Header onChangeTheme={changeTheme} />

      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full z-10">
        <ErrorDisplay />

        <WorkflowStepper stage={workflowStage} />

        <div className="w-full flex-grow flex flex-col items-center justify-center relative perspective-[1000px]">
          <AnimatePresence mode="wait">
            {workflowStage === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center"
              >
                <InputStage />
              </motion.div>
            )}
            {workflowStage === "verification" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center"
              >
                <VerificationStage />
              </motion.div>
            )}
            {workflowStage === "submitted" && (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center"
              >
                <SubmittedStage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <SettingsPanel />
      <DiagnosticsPanel />

      {/* Global Loading Overlay for Init */}
      <AnimatePresence>
        {isInitializing && !needsApiKeySetup && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white"
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-header tracking-widest animate-pulse">
              INITIALIZING SYSTEMS
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Setup Modal - First Launch */}
      {needsApiKeySetup && (
        <ApiKeySetupModal onComplete={completeApiKeySetup} />
      )}
    </div>
  );
}

export default App;
