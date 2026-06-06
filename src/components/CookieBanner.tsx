'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
    // In a real app you'd disable PostHog here
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5">We use cookies</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            We use essential cookies for login and optional analytics to improve the product.{' '}
            <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={decline}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors">
            Decline
          </button>
          <button onClick={accept}
            className="px-4 py-2 text-xs font-bold bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-colors">
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
