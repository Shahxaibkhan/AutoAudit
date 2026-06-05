'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ScanLine, Loader2, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = password.length === 0 ? null : password.length < 8 ? 'weak' : password.length < 12 ? 'fair' : 'strong'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 12) return toast.error('Password must be at least 12 characters')

    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error ?? 'Reset failed')
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 text-center">
        <div>
          <p className="text-slate-600 mb-4">Invalid reset link.</p>
          <Link href="/forgot-password" className="text-teal-600 font-semibold hover:underline">Request a new one →</Link>
        </div>
      </div>
    )
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

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Password updated!</h1>
            <p className="text-slate-500 text-sm">Redirecting you to login…</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set new password</h1>
              <p className="text-slate-500 mt-1.5 text-sm">Choose a strong password for <strong>{email}</strong></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white pr-10"
                    placeholder="Min. 12 characters"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1">
                      {['weak','fair','strong'].map((s, i) => (
                        <div key={s} className={`h-1 w-8 rounded-full ${
                          ['weak','fair','strong'].indexOf(strength) >= i
                            ? strength === 'weak' ? 'bg-red-400' : strength === 'fair' ? 'bg-amber-400' : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium capitalize ${
                      strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{strength}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</label>
                <input
                  type="password" required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white ${
                    confirm && confirm !== password ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Repeat password"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <button
                type="submit" disabled={loading || password !== confirm}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-all shadow-lg shadow-teal-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update password <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
