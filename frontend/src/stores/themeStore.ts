import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

// Apply theme to document
function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mode === "light") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}

// Get initial theme from system preference or default to dark
function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  const savedTheme = localStorage.getItem("theme-storage");
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state?.mode) {
        return parsed.state.mode;
      }
    } catch {
      // If parsing fails, fall through to system preference
    }
  }

  // Use system preference or default to dark
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Initialize theme immediately on module load
if (typeof window !== "undefined") {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: getInitialTheme(),

      setMode: (mode) => {
        set({ mode });
        applyTheme(mode);
      },

      toggleMode: () => {
        const newMode = get().mode === "light" ? "dark" : "light";
        set({ mode: newMode });
        applyTheme(newMode);
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);
