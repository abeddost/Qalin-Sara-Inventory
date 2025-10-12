'use client'

import { useTheme } from './theme-provider'
import { ReactNode } from 'react'

interface GlobalThemeWrapperProps {
  children: ReactNode
}

export function GlobalThemeWrapper({ children }: GlobalThemeWrapperProps) {
  const { theme } = useTheme()

  return (
    <div 
      style={{
        backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f9fafb',
        color: theme === 'dark' ? '#f5f5f5' : '#111827',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {children}
    </div>
  )
}
