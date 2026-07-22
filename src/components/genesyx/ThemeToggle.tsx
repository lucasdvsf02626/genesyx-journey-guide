import { useEffect, useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { updateTheme } from "@/lib/account.functions";

const STORAGE_KEY = "gx-theme";
const USER_SET_KEY = "gx-theme-user-set";
type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>("light");
  const saveTheme = useServerFn(updateTheme);

  // Light is the fixed default. Only apply dark when this browser has an
  // explicit user choice, so old saved/profile defaults cannot flip pages dark.
  useEffect(() => {
    const saved: Theme = (() => {
      if (typeof window === "undefined") return "light";
      const userSetTheme = localStorage.getItem(USER_SET_KEY) === "true";
      if (!userSetTheme) return "light";
      return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    })();
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem(USER_SET_KEY, "true");
    } catch {}
    if (user) {
      saveTheme({ data: { theme: next } }).catch(() => {});
    }
  }, [theme, user, saveTheme]);

  return { theme, toggle };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full",
        "bg-card text-foreground gx-hairline transition-colors hover:opacity-90",
        className,
      )}
    >
      {isDark ? <Sun className="h-4.5 w-4.5" size={18} /> : <Moon size={18} />}
    </button>
  );
}
