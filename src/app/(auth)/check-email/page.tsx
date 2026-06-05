'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ScanLine, Mail, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function resend() {
    if (!email) return
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setResent(true)
        toast.success('Verification email resent!')
      } else {
        toast.error('Could not resend — please try again')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900">AutoAuditAI</span>
        </Link>

        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-teal-600" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Check your inbox</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-2">
          We sent a verification link to
        </p>
        {email && (
          <p className="font-semibold text-slate-800 text-sm mb-6">{email}</p>
        )}
        <p className="text-slate-400 text-xs mb-8">
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>

        {resent ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Email resent successfully
          </div>
        ) : (
          <button
            onClick={resend}
            disabled={resending}
            className="inline-flex items-center gap-2 text-sm text-teal-600 font-semibold hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending…' : "Didn't receive it? Resend email"}
          </button>
        )}

        <p className="text-center text-xs text-slate-400 mt-8">
          Wrong email?{' '}
          <Link href="/register" className="text-teal-600 hover:underline font-medium">
            Sign up again
          </Link>
          {' · '}
          <Link href="/login" className="text-teal-600 hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
