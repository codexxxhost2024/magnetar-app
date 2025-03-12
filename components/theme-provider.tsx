"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force light mode by overriding props
  return (
    <NextThemesProvider forcedTheme="light" {...props}>
      {children}
    </NextThemesProvider>
  )
}

