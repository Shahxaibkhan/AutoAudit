'use client'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, CheckCircle } from 'lucide-react'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline text-sm">Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CarPect Demo</h1>
        <p className="text-gray-500 text-sm mb-10">Preparing your demo environment…</p>

        <div className="space-y-3 text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step ? 'bg-green-100' : i === step ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {i < step ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : i === step ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={`text-sm transition-colors ${
                i < step ? 'text-green-700 font-medium' : i === step ? 'text-blue-700 font-medium' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          No sign-up needed · Read-only demo account · Resets automatically
        </p>
      </div>
    </div>
  )
}
