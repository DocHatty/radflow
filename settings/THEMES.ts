import { Theme } from "../types";

export const themes: Theme[] = [
  {
    // Cinematic Dark Glassmorphism (The Digital Reading Room)
    colors: {
      base: "#020617", // slate-950 - Deep Void
      gradientBgFrom: "#0f172a", // slate-900

      panelBg: "rgba(15, 23, 42, 0.6)", // slate-900 glass
      panelHighlight: "rgba(255, 255, 255, 0.05)",

      // Primary: Blue (Technology/Calm)
      primary: "#3b82f6", // blue-500
      primaryGlow: "rgba(59, 130, 246, 0.4)",

      // Secondary: Sky/Cyan (Information)
      secondary: "#0ea5e9", // sky-500
      secondaryHighlight: "#38bdf8", // sky-400

      // Gradients: Blue to Red (Urgency/Action)
      gradientFrom: "#2563eb", // blue-600
      gradientTo: "#f43f5e", // rose-500
      gradientTextTo: "#e11d48", // rose-600

      // Text: Highly legible Inter grays
      textDefault: "#cbd5e1", // slate-300
      textMuted: "#94a3b8", // slate-400
      textBright: "#f8fafc", // slate-50

      // Borders: Subtle slate
      border: "rgba(148, 163, 184, 0.15)", // slate-400/15
      borderHover: "rgba(148, 163, 184, 0.3)", // slate-400/30

      pulseGlow1: "rgba(59, 130, 246, 0.4)",
      pulseGlow2: "rgba(244, 63, 94, 0.4)",

      shadowDefault: "rgba(0, 0, 0, 0.5)",
      scrollbarThumb: "rgba(71, 85, 105, 0.4)",

      // Interactive Elements
      interactiveBg: "rgba(30, 41, 59, 0.4)", // slate-800 glass
      interactiveBgHover: "rgba(51, 65, 85, 0.4)", // slate-700 glass

      inputBg: "rgba(2, 6, 23, 0.5)",
      inputBgFocus: "rgba(2, 6, 23, 0.8)",

      // Semantic / Functional Colors (Bento Grid style)
      // Success (Emerald) - Search patterns
      successBg: "rgba(6, 78, 59, 0.2)",
      successBorder: "rgba(16, 185, 129, 0.3)",
      successText: "#34d399", // emerald-400

      // Warning (Amber) - Facts
      warningBg: "rgba(69, 26, 3, 0.2)",
      warningBorder: "rgba(245, 158, 11, 0.3)",
      warningText: "#fbbf24", // amber-400
      warningPulseBorder: "rgba(245, 158, 11, 0.6)",

      // Danger (Red) - Pitfalls/Pathology
      dangerBg: "rgba(69, 10, 10, 0.2)",
      dangerBorder: "rgba(239, 68, 68, 0.3)",
      dangerText: "#f87171", // red-400

      // Info (Sky)
      infoBg: "rgba(12, 74, 110, 0.2)",
      infoBorder: "rgba(14, 165, 233, 0.3)",
      infoText: "#38bdf8", // sky-400

      disabledBg: "rgba(15, 23, 42, 0.8)",
      disabledText: "#475569",

      // Prior Findings (Yellow/Amber highlight in text)
      priorFindingHighlightBg: "rgba(217, 119, 6, 0.15)",
      priorFindingHighlightBorder: "rgba(217, 119, 6, 0.3)",
      priorFindingHighlightText: "#fbbf24",
    },
  },
];
