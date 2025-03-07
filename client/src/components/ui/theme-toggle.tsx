"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/ThemeProvider"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && getSystemTheme() === "dark")

  function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div
      className={cn(
        "flex w-16 h-8 items-center justify-between rounded-md bg-muted/30 p-1 text-muted-foreground transition-all duration-300",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
    >
      <div 
        className={cn(
          "flex justify-center items-center rounded-md transition-all duration-300 text-xs font-medium",
          isDark 
            ? "size-6 bg-background text-foreground shadow-sm" 
            : "size-6"
        )}
      >
        <Moon 
          className={cn(
            "size-4",
            isDark ? "text-foreground" : "text-muted-foreground"
          )}
          strokeWidth={1.5}
        />
      </div>
      <div 
        className={cn(
          "flex justify-center items-center rounded-md transition-all duration-300 text-xs font-medium",
          !isDark 
            ? "size-6 bg-background text-foreground shadow-sm" 
            : "size-6"
        )}
      >
        <Sun 
          className={cn(
            "size-4",
            !isDark ? "text-foreground" : "text-muted-foreground"
          )}
          strokeWidth={1.5}
        />
      </div>
    </div>
  )
}