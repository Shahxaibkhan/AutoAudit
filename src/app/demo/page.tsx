'use client'
import { useEffect, useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScanLine, Loader2, CheckCircle, Car, Building2, Truck, ShieldCheck, Wrench, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const INDUSTRIES = [
  {
    key: 'rental',
    label: 'Car Rentals',
    icon: Car,
    color: 'from-teal-500 to-teal-600',
    glow: 'shadow-teal-500/25',
    border: 'hover:border-teal-500/40',
    badge: 'bg-teal-500/10 text-teal-300',
    desc: 'Document pre/post-rental condition, resolve disputes with timestamped AI evidence.',
  },
  {
    key: 'dealer',
    label: 'Dealerships',
    icon: Building2,
    color: 'from-indigo-500 to-indigo-600',
    glow: 'shadow-indigo-500/25',
    border: 'hover:border-indigo-500/40',
    badge: 'bg-indigo-500/10 text-indigo-300',
    desc: 'Pre-sale condition reports that build buyer trust and protect trade-in values.',
  },
  {
    key: 'fleet',
    label: 'Fleet Managers',
    icon: Truck,
    color: 'from-cyan-500 to-cyan-600',
    glow: 'shadow-cyan-500/25',
    border: 'hover:border-cyan-500/40',
    badge: 'bg-cyan-500/10 text-cyan-300',
    desc: 'Shift-by-shift driver accountability across your entire vehicle fleet.',
  },
  {
    key: 'insurance',
    label: 'Insurance',
    icon: ShieldCheck,
    color: 'from-violet-500 to-violet-600',
    glow: 'shadow-violet-500/25',
    border: 'hover:border-violet-500/40',
    badge: 'bg-violet-500/10 text-violet-300',
    desc: 'Pre/post-claim documentation that speeds up assessment and reduces fraud.',
  },
  {
    key: 'bodyshop',
    label: 'Body Shops',
    icon: Wrench,
    color: 'from-amber-500 to-amber-600',
    glow: 'shadow-amber-500/25',
    border: 'hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-300',
    desc: 'Drop-off vs pick-up comparisons that justify repair costs transparently.',
  },
  {
    key: 'leasing',
    label: 'Leasing',
    icon: FileText,
    color: 'from-rose-500 to-rose-600',
    glow: 'shadow-rose-500/25',
    border: 'hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-300',
    desc: 'Lease-start vs lease-end inspections that accurately charge for excess wear.',
  },
]

const STEPS = [
  'Setting up demo account…',
  'Loading sample vehicles…',
  'Adding inspection data…',
  'Signing you in…',
]

function DemoLauncher({ industry }: { industry: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const cfg = INDUSTRIES.find(i => i.key === industry) ?? INDUSTRIES[0]

  useEffect(() => {
    async function startDemo() {
      try {
        setStep(0)
        const res = await fetch(`/api/demo/instant?industry=${industry}`)
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
  }, [industry, router])

  if (error) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <Link href="/demo" className="text-teal-400 hover:underline text-sm">Choose a different demo</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className={`w-16 h-16 bg-gradient-to-br ${cfg.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${cfg.glow} animate-pulse-glow`}>
          <cfg.icon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">AutoAuditAI Demo</h1>
        <p className="text-slate-400 text-sm mb-10">Loading the <span className="text-white font-semibold">{cfg.label}</span> demo…</p>

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

function DemoSelector() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-teal-500/30">
            <ScanLine className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Choose your industry</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            AutoAuditAI works across 6 industries. Pick one to see a realistic demo loaded with sample data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {INDUSTRIES.map(ind => (
            <Link
              key={ind.key}
              href={`/demo?industry=${ind.key}`}
              className={`group relative bg-white/5 border border-white/10 ${ind.border} rounded-2xl p-6 backdrop-blur-sm transition-all hover:bg-white/8 hover:-translate-y-0.5`}
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${ind.color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${ind.glow}`}>
                <ind.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-base">{ind.label}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{ind.desc}</p>
              <div className="flex items-center gap-1.5 text-teal-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                Try demo <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600">
          No sign-up needed · Each demo resets automatically · Read-only data
        </p>
      </div>
    </div>
  )
}

function DemoPageInner() {
  const searchParams = useSearchParams()
  const industry = searchParams.get('industry')

  if (industry && Object.keys(Object.fromEntries(INDUSTRIES.map(i => [i.key, true]))).includes(industry)) {
    return <DemoLauncher industry={industry} />
  }

  return <DemoSelector />
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    }>
      <DemoPageInner />
    </Suspense>
  )
}
