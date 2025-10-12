'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Locale = 'en' | 'es' | 'fr' | 'de' | 'ar'

type LocaleProviderProps = {
  children: React.ReactNode
  defaultLocale?: Locale
  storageKey?: string
}

type LocaleProviderState = {
  locale: Locale
  setLocale: (locale: Locale) => void
  timezone: string
  setTimezone: (timezone: string) => void
  dateFormat: string
  setDateFormat: (format: string) => void
  currencyPosition: 'before' | 'after'
  setCurrencyPosition: (position: 'before' | 'after') => void
}

const initialState: LocaleProviderState = {
  locale: 'en',
  setLocale: () => null,
  timezone: 'America/New_York',
  setTimezone: () => null,
  dateFormat: 'MM/DD/YYYY',
  setDateFormat: () => null,
  currencyPosition: 'before',
  setCurrencyPosition: () => null,
}

const LocaleProviderContext = createContext<LocaleProviderState>(initialState)

export function LocaleProvider({
  children,
  defaultLocale = 'en',
  storageKey = 'vite-ui-locale',
  ...props
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [timezone, setTimezoneState] = useState<string>('America/New_York')
  const [dateFormat, setDateFormatState] = useState<string>('MM/DD/YYYY')
  const [currencyPosition, setCurrencyPositionState] = useState<'before' | 'after'>('before')

  useEffect(() => {
    const storedLocale = localStorage.getItem(`${storageKey}-locale`) as Locale
    const storedTimezone = localStorage.getItem(`${storageKey}-timezone`)
    const storedDateFormat = localStorage.getItem(`${storageKey}-dateFormat`)
    const storedCurrencyPosition = localStorage.getItem(`${storageKey}-currencyPosition`) as 'before' | 'after'
    
    if (storedLocale) setLocaleState(storedLocale)
    if (storedTimezone) setTimezoneState(storedTimezone)
    if (storedDateFormat) setDateFormatState(storedDateFormat)
    if (storedCurrencyPosition) setCurrencyPositionState(storedCurrencyPosition)
  }, [storageKey])

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem(`${storageKey}-locale`, newLocale)
    setLocaleState(newLocale)
  }

  const setTimezone = (newTimezone: string) => {
    localStorage.setItem(`${storageKey}-timezone`, newTimezone)
    setTimezoneState(newTimezone)
  }

  const setDateFormat = (newFormat: string) => {
    localStorage.setItem(`${storageKey}-dateFormat`, newFormat)
    setDateFormatState(newFormat)
  }

  const setCurrencyPosition = (newPosition: 'before' | 'after') => {
    localStorage.setItem(`${storageKey}-currencyPosition`, newPosition)
    setCurrencyPositionState(newPosition)
  }

  const value = {
    locale,
    setLocale,
    timezone,
    setTimezone,
    dateFormat,
    setDateFormat,
    currencyPosition,
    setCurrencyPosition,
  }

  return (
    <LocaleProviderContext.Provider {...props} value={value}>
      {children}
    </LocaleProviderContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleProviderContext)

  if (context === undefined)
    throw new Error('useLocale must be used within a LocaleProvider')

  return context
}
