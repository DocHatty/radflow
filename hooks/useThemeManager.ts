import { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "../App";
import { Theme } from "../types";

export const useThemeManager = () => {
  const settings = useWorkflowStore((state) => state.settings);
  const [themeIndex, setThemeIndex] = useState(0);

  const themes: Theme[] = settings?.themes || [];
  const currentTheme = themes[themeIndex];

  useEffect(() => {
    if (currentTheme) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        document.documentElement.style.setProperty(cssVarName, value);
      });
    }
  }, [currentTheme]);

  const changeTheme = useCallback(() => {
    if (themes.length > 0) {
      setThemeIndex((prevIndex) => (prevIndex + 1) % themes.length);
    }
  }, [themes.length]);

  return { changeTheme };
};
