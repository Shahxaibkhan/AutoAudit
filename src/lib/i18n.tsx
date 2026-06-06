'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import en from '@/messages/en.json'
import ur from '@/messages/ur.json'
import id from '@/messages/id.json'
import ms from '@/messages/ms.json'

export type Locale = 'en' | 'ur' | 'id' | 'ms'

const messages = { en, ur, id, ms }

export const LOCALES: { code: Locale; label: string; nativeLabel: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English',    nativeLabel: 'English',    dir: 'ltr' },
  { code: 'ur', label: 'Urdu',       nativeLabel: 'اردو',        dir: 'rtl' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ms', label: 'Malay',      nativeLabel: 'Bahasa Melayu',   dir: 'ltr' },
]

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
  currency: { symbol: string; code: string; locale: string }
  formatCurrency: (amount: number) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    } else return key
  }
  return typeof current === 'string' ? current : key
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && messages[saved]) {
      setLocaleState(saved)
      document.documentElement.dir = LOCALES.find(l => l.code === saved)?.dir ?? 'ltr'
      document.documentElement.lang = saved
    }
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('locale', l)
    const info = LOCALES.find(loc => loc.code === l)
    document.documentElement.dir = info?.dir ?? 'ltr'
    document.documentElement.lang = l
  }

  const msgs = messages[locale] as Record<string, unknown>
  const t = (key: string) => getNestedValue(msgs, key)
  const dir = LOCALES.find(l => l.code === locale)?.dir ?? 'ltr'
  const currency = (messages[locale] as { currency: { symbol: string; code: string; locale: string } }).currency

  function formatCurrency(amount: number): string {
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch {
      return `${currency.symbol}${amount.toLocaleString()}`
    }
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, currency, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
