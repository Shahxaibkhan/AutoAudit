'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-xl px-4 py-4">
            <div className="flex flex-col gap-1 mb-4">
              {[
                { href: '#features', label: 'Features' },
                { href: '#industries', label: 'Industries' },
                { href: '#pricing', label: 'Pricing' },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Link href="/login" onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl text-center"
              >
                Sign in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all"
              >
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/demo" onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Try demo
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
