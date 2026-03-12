"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // or a placeholder

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
    >
      {isDark ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} />
      )}
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  )
}