import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export const ThemeSwitcher: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { mode, setMode } = useThemeStore();

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg border transition-colors",
        "bg-muted/50 backdrop-blur-sm border-border",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("light")}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200",
          mode === "light"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        aria-label="Switch to light mode"
      >
        <Sun
          className={cn(
            "h-4 w-4 transition-all duration-200",
            mode === "light"
              ? "rotate-0 scale-110"
              : "rotate-90 scale-100 opacity-70",
          )}
        />
        <span className="text-xs font-medium hidden sm:inline">Light</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("dark")}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200",
          mode === "dark"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        aria-label="Switch to dark mode"
      >
        <Moon
          className={cn(
            "h-4 w-4 transition-all duration-200",
            mode === "dark"
              ? "rotate-0 scale-110"
              : "-rotate-90 scale-100 opacity-70",
          )}
        />
        <span className="text-xs font-medium hidden sm:inline">Dark</span>
      </Button>
    </div>
  );
};
