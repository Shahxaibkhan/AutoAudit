'use client'
import { X, CheckCircle, MessageCircle } from 'lucide-react'

const WA_NUMBER = '923434994409'

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

interface Props {
  isOpen: boolean
  onClose: () => void
  accountType: 'b2c' | 'b2b'
}

const B2C_PLANS = [
  {
    name: 'Quick',
    price: '$0.99',
    period: '/inspection',
    highlight: false,
    features: ['8-photo guided capture', 'AI damage detection', 'Condition grade A–F', 'Web report'],
  },
  {
    name: 'Full',
    price: '$2.99',
    period: '/inspection',
    highlight: true,
    badge: 'Recommended',
    features: ['Photos or video walkaround', 'Hidden damage indicators', 'AI recommendations', 'PDF download'],
  },
]

const B2B_PLANS = [
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    highlight: false,
    features: ['50 inspection credits', 'Before/after comparison', 'PDF reports', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/mo',
    highlight: true,
    badge: 'Most popular',
    features: ['200 inspection credits', 'Multi-vehicle dashboard', 'Priority support', 'All Starter features'],
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    highlight: false,
    features: ['600 inspection credits', 'API access', 'Dedicated onboarding', 'All Growth features'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    features: ['Unlimited inspections', 'White-label option', 'Custom integrations', 'SLA + dedicated support'],
  },
]

export default function UpgradeModal({ isOpen, onClose, accountType }: Props) {
  if (!isOpen) return null

  const isB2C = accountType === 'b2c'
  const plans = isB2C ? B2C_PLANS : B2B_PLANS

  const waMessage = isB2C
    ? "Hi! I'd like to upgrade my CarPect account. Can you help me get started?"
    : "Hi! I'm interested in CarPect for my business. Can we discuss a plan?"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">
              {isB2C ? 'Upgrade your plan' : 'Talk to our team'}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isB2C ? 'Choose an inspection package' : 'CarPect for Business'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isB2C
                ? 'Pay per inspection — no subscription needed.'
                : 'Monthly credits for your fleet or business. No per-user fees.'}
            </p>
          </div>

          {/* Plans grid */}
          <div className={`grid gap-4 mb-6 ${isB2C ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {plans.map(plan => (
              <div key={plan.name}
                className={`relative rounded-2xl p-4 border-2 transition-all ${
                  plan.highlight
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-white'
                }`}>
                {'badge' in plan && plan.badge && (
                  <span className="absolute -top-2.5 left-4 text-xs bg-teal-500 text-white px-2.5 py-0.5 rounded-full font-semibold">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-xl font-black ${plan.highlight ? 'text-teal-800' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  )}
                </div>
                <p className={`text-sm font-bold mb-2 ${plan.highlight ? 'text-teal-800' : 'text-slate-700'}`}>
                  {plan.name}
                </p>
                <ul className="space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={waLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#25D366] hover:bg-[#20b558] text-white rounded-2xl text-sm font-bold transition-colors shadow-lg shadow-green-500/20">
            <MessageCircle className="w-5 h-5" />
            {isB2C ? 'Contact us on WhatsApp to get started' : 'Contact Sales on WhatsApp'}
          </a>

          <p className="text-center text-xs text-slate-400 mt-3">
            We typically respond within a few minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
