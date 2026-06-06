'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ScanLine, Loader2, ArrowRight, CheckCircle, Mail, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified') === '1'
  const tokenExpired = searchParams.get('error') === 'token_expired'

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendingVerification, setResendingVerification] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setUnverifiedEmail(null)
    const res = await signIn('credentials', { ...form, redirect: false })
    setLoading(false)

    if (res?.error === 'email_not_verified') {
      setUnverifiedEmail(form.email)
    } else if (res?.error === 'too_many_attempts') {
      toast.error('Too many login attempts. Please wait 15 minutes and try again.')
    } else if (res?.error === 'account_blocked') {
      toast.error('Your account has been suspended. Contact support at +92-343-4994409.', { duration: 6000 })
    } else if (res?.error) {
      toast.error('Invalid email or password')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function resendVerification() {
    if (!unverifiedEmail) return
    setResendingVerification(true)
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      })
      toast.success('Verification email sent!')
    } catch {
      toast.error('Could not resend — try again')
    } finally {
      setResendingVerification(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex w-1/2 mesh-bg flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl" />
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/40">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">AutoAuditAI</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Protect your fleet.<br />
            <span className="gradient-text">Eliminate disputes.</span>
          </h2>
          <p className="text-slate-400 mb-8">AI-powered inspection that takes 3 minutes and saves thousands.</p>
          <div className="space-y-3">
            {[
              'Detect damage before every rental',
              'Compare before/after automatically',
              'Generate PDF reports instantly',
            ].map(point => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <span className="text-slate-300 text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10">© 2026 AutoAuditAI</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900">AutoAuditAI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Success: email verified */}
          {verified && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-emerald-800">Email verified! You can now sign in.</p>
            </div>
          )}

          {/* Error: token expired */}
          {tokenExpired && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-sm font-medium text-amber-800">Verification link expired. Sign in to request a new one.</p>
            </div>
          )}

          {/* Email not verified banner */}
          {unverifiedEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Please verify your email</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Check your inbox for the verification link we sent to <strong>{unverifiedEmail}</strong>.
                  </p>
                  <button
                    onClick={resendVerification}
                    disabled={resendingVerification}
                    className="text-xs text-amber-800 font-semibold underline underline-offset-2 mt-2 disabled:opacity-50"
                  >
                    {resendingVerification ? 'Sending…' : 'Resend verification email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white"
                placeholder="you@business.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-teal-600 hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-all shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-px mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">or</span>
            </div>
          </div>

          <Link href="/demo" className="w-full flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-600 py-3 rounded-xl text-sm font-semibold hover:border-slate-200 hover:bg-slate-50 transition-all">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Try the live demo instead
          </Link>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account?{' '}
            <Link href="/register" className="text-teal-600 font-semibold hover:underline">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
