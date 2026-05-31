'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, Zap, ArrowRight, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react'
import { PLANS, trialDaysLeft, creditsRemaining } from '@/lib/subscription'
import toast from 'react-hot-toast'

interface UsageData {
  plan: string
  trialEndsAt: string | null
  createdAt: string
  creditsUsed: number
  creditsTotal: number
  subStatus: string | null
  subPeriodEnd: string | null
  stripeConfigured: boolean
}

const UPGRADE_PLANS = [
  {
    key: 'STARTER', name: 'Starter', price: '$19', period: '/mo',
    credits: '50 inspections/mo',
    features: ['50 AI analyses/month', 'Before/after comparison', 'PDF reports', 'Email support'],
    highlight: false,
  },
  {
    key: 'GROWTH', name: 'Growth', price: '$49', period: '/mo',
    credits: '200 inspections/mo',
    features: ['200 AI analyses/month', 'All Starter features', 'Multi-vehicle dashboard', 'Priority support'],
    highlight: true,
  },
  {
    key: 'PRO', name: 'Pro', price: '$99', period: '/mo',
    credits: '600 inspections/mo',
    features: ['600 AI analyses/month', 'All Growth features', 'API access', 'Dedicated onboarding'],
    highlight: false,
  },
  {
    key: 'ENTERPRISE', name: 'Enterprise', price: 'Custom', period: '',
    credits: 'Unlimited',
    features: ['Unlimited analyses', 'White-label option', 'Custom integrations', 'SLA + dedicated support'],
    highlight: false,
  },
]

export default function BillingPage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)

  useEffect(() => {
    fetch('/api/billing/usage').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  async function upgrade(plan: string) {
    if (plan === 'ENTERPRISE') {
      window.location.href = 'mailto:hello@autoauditai.com?subject=Enterprise Plan Inquiry'
      return
    }
    setCheckingOut(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.href = json.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open checkout')
      setCheckingOut(null)
    }
  }

  async function openPortal() {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.href = json.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal')
      setOpeningPortal(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-xl w-48" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const plan = data.plan as keyof typeof PLANS
  const planInfo = PLANS[plan] ?? PLANS.TRIAL
  const daysLeft = trialDaysLeft(data.trialEndsAt ? new Date(data.trialEndsAt) : null, new Date(data.createdAt))
  const remaining = creditsRemaining(data.creditsUsed, data.creditsTotal)
  const usagePct = Math.min(100, (data.creditsUsed / data.creditsTotal) * 100)
  const isPaid = plan !== 'TRIAL'
  const isActive = isPaid && data.subStatus === 'active'

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Usage</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your plan and AI inspection credits</p>
        </div>
        {isActive && (
          <button
            onClick={openPortal}
            disabled={openingPortal}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            {openingPortal ? 'Opening…' : 'Manage subscription'}
          </button>
        )}
      </div>

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current plan</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{planInfo.name}</span>
              {plan === 'TRIAL' && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${daysLeft <= 3 ? 'bg-red-50 text-red-700' : 'bg-teal-50 text-teal-700'}`}>
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
              )}
              {isActive && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Active</span>}
              {isPaid && data.subStatus === 'past_due' && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700">Payment failed</span>}
            </div>
          </div>
          {data.subPeriodEnd && isActive && (
            <div className="text-sm text-slate-400 shrink-0">
              <p>Next renewal</p>
              <p className="font-semibold text-slate-700">{new Date(data.subPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {/* Credits usage bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">AI Analyses</p>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-900">{data.creditsUsed}</span> / {data.creditsTotal === 999999 ? '∞' : data.creditsTotal} used
            </p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
              style={{ width: `${data.creditsTotal === 999999 ? 5 : usagePct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {data.creditsTotal === 999999
              ? 'Unlimited analyses'
              : `${remaining} analyse${remaining !== 1 ? 's' : ''} remaining`}
            {!isPaid && ` · Resets when you upgrade`}
            {isActive && ` · Resets on renewal`}
          </p>
        </div>

        {/* Warnings */}
        {plan === 'TRIAL' && daysLeft === 0 && (
          <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">Your trial has expired. Upgrade to continue using AI analysis.</p>
          </div>
        )}
        {remaining === 0 && plan !== 'ENTERPRISE' && (
          <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium">
              {isPaid ? 'You\'ve used all your credits for this billing period. Upgrade to a higher plan for more.' : `You've used all ${data.creditsTotal} trial analyses. Upgrade to continue.`}
            </p>
          </div>
        )}
      </div>

      {/* Upgrade section (hide if Enterprise) */}
      {plan !== 'ENTERPRISE' && (
        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4">
            {isPaid ? 'Change plan' : 'Upgrade your plan'}
          </h2>

          {!data.stripeConfigured && (
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
              <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Stripe not connected yet</p>
                <p>Add <code className="bg-slate-200 px-1 py-0.5 rounded text-xs">STRIPE_SECRET_KEY</code> and price IDs to your environment variables to enable payments.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UPGRADE_PLANS.map(p => {
              const isCurrent = plan === p.key
              return (
                <div
                  key={p.key}
                  className={`relative rounded-2xl p-5 border transition-all ${
                    p.highlight
                      ? 'bg-teal-600 border-teal-500 shadow-lg shadow-teal-500/20'
                      : 'bg-white border-slate-200 shadow-sm'
                  } ${isCurrent ? 'ring-2 ring-teal-400' : ''}`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-3 py-0.5 rounded-full">
                      POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-3 bg-teal-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      CURRENT
                    </div>
                  )}
                  <div className="mb-4">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${p.highlight ? 'text-teal-100' : 'text-slate-400'}`}>{p.name}</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-3xl font-black ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                      <span className={`text-sm ${p.highlight ? 'text-teal-200' : 'text-slate-400'}`}>{p.period}</span>
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${p.highlight ? 'text-teal-100' : 'text-teal-600'}`}>{p.credits}</p>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.highlight ? 'text-teal-200' : 'text-teal-500'}`} />
                        <span className={p.highlight ? 'text-teal-50' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => upgrade(p.key)}
                    disabled={isCurrent || checkingOut === p.key || !data.stripeConfigured && p.key !== 'ENTERPRISE'}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                      p.highlight
                        ? 'bg-white text-teal-700 hover:bg-teal-50'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {checkingOut === p.key ? 'Opening…' : isCurrent ? 'Current plan' : p.key === 'ENTERPRISE' ? 'Contact us' : 'Upgrade'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
