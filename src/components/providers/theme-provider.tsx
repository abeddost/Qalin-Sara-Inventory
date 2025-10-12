'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
      setTheme(stored)
    }
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove all theme classes first
    root.classList.remove('light', 'dark')

    let resolvedTheme = theme
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Apply the resolved theme
    root.classList.add(resolvedTheme)
    root.setAttribute('data-theme', resolvedTheme)
    
    // Force the background color with !important
    if (resolvedTheme === 'dark') {
      root.style.setProperty('background-color', '#0f0f0f', 'important')
      document.body.style.setProperty('background-color', '#0f0f0f', 'important')
      document.body.style.setProperty('color', '#f5f5f5', 'important')
    } else {
      root.style.setProperty('background-color', '#ffffff', 'important')
      document.body.style.setProperty('background-color', '#ffffff', 'important')
      document.body.style.setProperty('color', '#000000', 'important')
    }
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}