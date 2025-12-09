import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "auto";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme;
      return saved || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: Theme) => {
      if (t === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("auto");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const themes: { value: Theme; label: string; icon: typeof Moon }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "auto", label: "Auto", icon: Monitor },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "fixed top-4 right-4 z-50 p-2.5 xs:p-3 rounded-full backdrop-blur-lg transition-all duration-300",
        "bg-white/10 hover:bg-white/20 border border-primary/30",
        "shadow-lg shadow-primary/20 hover:shadow-primary/40",
        "hover:-translate-y-1 active:scale-95 touch-manipulation",
        "flex items-center justify-center min-w-[44px] min-h-[44px]",
        "pointer-events-auto cursor-pointer select-none",
        "top-safe-top right-safe-right"
      )}
      style={{
        position: 'fixed',
        top: 'max(1rem, env(safe-area-inset-top, 0px) + 1rem)',
        right: 'max(1rem, env(safe-area-inset-right, 0px) + 1rem)',
      }}
      title={`Theme: ${currentTheme.label} (Click to cycle)`}
      aria-label={`Current theme: ${currentTheme.label}. Click to change theme.`}
    >
      <CurrentIcon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
    </button>
  );
};

export default ThemeSwitcher;

