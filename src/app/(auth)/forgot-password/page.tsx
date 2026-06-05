'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ScanLine, Loader2, ArrowRight, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true) // always show success to avoid email enumeration
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900">AutoAuditAI</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Check your inbox</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              If <strong>{email}</strong> is registered, we&apos;ve sent a password reset link. It expires in 1 hour.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-teal-600 font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot password?</h1>
              <p className="text-slate-500 mt-1.5 text-sm">Enter your email and we&apos;ll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white"
                  placeholder="you@business.com"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-all shadow-lg shadow-teal-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send reset link <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              <Link href="/login" className="text-teal-600 font-semibold hover:underline">← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
