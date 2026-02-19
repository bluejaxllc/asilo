"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-lg", className)}>
                <Sun className="h-4 w-4" />
            </Button>
        )
    }

    const isDark = theme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "relative h-9 w-9 rounded-lg transition-colors",
                isDark
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
                className
            )}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            <Sun className={cn(
                "h-4 w-4 transition-all duration-300",
                isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )} style={{ position: isDark ? 'absolute' : 'relative' }} />
            <Moon className={cn(
                "h-4 w-4 transition-all duration-300",
                isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )} style={{ position: isDark ? 'relative' : 'absolute' }} />
            <span className="sr-only">
                {isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            </span>
        </Button>
    )
}
