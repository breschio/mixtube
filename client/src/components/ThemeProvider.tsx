import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  // Try different methods to detect system theme
  if (window.matchMedia) {
    // Standard method
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    // iOS/Safari specific
    if (window.matchMedia("(-apple-system-dark-mode)").matches) return "dark";
  }

  // Fallback for older browsers
  return "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "mixtube-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      return stored || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
    root.classList.add(effectiveTheme);

    // Force a repaint to ensure the theme is applied
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  }, [theme]);

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(-apple-system-dark-mode)")
    ];

    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(getSystemTheme());
      }
    };

    mediaQueries.forEach(mediaQuery => {
      // Modern API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      }
      // Legacy API (for older browsers)
      else if ('addListener' in mediaQuery) {
        (mediaQuery as any).addListener(handleChange);
      }
    });

    return () => {
      mediaQueries.forEach(mediaQuery => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        }
        else if ('removeListener' in mediaQuery) {
          (mediaQuery as any).removeListener(handleChange);
        }
      });
    };
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};