'use client'
import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useI18n, LOCALES, type Locale } from '@/lib/i18n'

export default function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(code: Locale) {
    setLocale(code)
    setOpen(false)
  }

  const base = dark
    ? 'text-slate-400 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/5'
    : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${base}`}
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span>{current.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                l.code === locale
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              dir={l.dir}
            >
              <span>{l.nativeLabel}</span>
              <span className="text-xs text-slate-400 font-normal">{l.label}</span>
            </button>
          ))}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400">More languages coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
