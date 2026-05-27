'use client'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ScanLine, Loader2, CheckCircle } from 'lucide-react'

const STEPS = [
  'Setting up demo account…',
  'Loading sample vehicles…',
  'Adding inspection data…',
  'Signing you in…',
]

export default function DemoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    async function startDemo() {
      try {
        setStep(0)
        const res = await fetch('/api/demo/instant')
        if (!res.ok) throw new Error('Failed to prepare demo')
        const { email, password } = await res.json()

        setStep(3)
        const result = await signIn('credentials', { email, password, redirect: false })
        if (result?.error) throw new Error('Sign-in failed')

        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    const timers = STEPS.slice(0, 3).map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 700)
    )
    setTimeout(startDemo, 2200)

    return () => timers.forEach(clearTimeout)
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-teal-400 hover:underline text-sm">Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/30 animate-pulse-glow">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">AutoAuditAI Demo</h1>
        <p className="text-slate-400 text-sm mb-10">Preparing your demo environment…</p>

        <div className="space-y-3 text-left bg-white/5 rounded-2xl border border-white/10 p-6 mb-8 backdrop-blur-sm">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step ? 'bg-teal-500/20' : i === step ? 'bg-teal-500/10' : 'bg-white/5'
              }`}>
                {i < step ? (
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                ) : i === step ? (
                  <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
              <span className={`text-sm transition-colors ${
                i < step ? 'text-teal-300 font-medium' : i === step ? 'text-white font-medium' : 'text-slate-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-600">
          No sign-up needed · Read-only demo account · Resets automatically
        </p>
      </div>
    </div>
  )
}
