'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, MessageCircle } from 'lucide-react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute top-16 left-0 right-0 z-50 bg-slate-950 border-b border-white/10 shadow-2xl px-4 py-4">
            <div className="flex flex-col gap-0.5 mb-4">
              {[
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How it works' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#faq', label: 'FAQ' },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
              <Link href="/login" onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-center transition-colors"
              >
                Sign in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 bg-teal-500 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-400 transition-all"
              >
                Start free trial <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/demo" onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 border border-white/15 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Try live demo
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
