'use client'

import { useLocale } from '@/components/providers/locale-provider'
import { en } from '@/lib/translations/en'
import { es } from '@/lib/translations/es'
import { fr } from '@/lib/translations/fr'
import { de } from '@/lib/translations/de'
import { ar } from '@/lib/translations/ar'

const translations = {
  en,
  es,
  fr,
  de,
  ar
}

export function useTranslation() {
  const { locale } = useLocale()
  
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[locale] || translations.en
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  return { t, locale }
}
