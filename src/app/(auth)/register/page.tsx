'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ScanLine, Loader2, ArrowRight, Shield, Zap, BarChart3, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const INDUSTRIES = [
  { value: 'rental', label: 'Car Rental Business' },
  { value: 'dealer', label: 'Car Dealership' },
  { value: 'fleet', label: 'Fleet Management' },
  { value: 'buyer', label: 'Used Car Buyer' },
  { value: 'seller', label: 'Used Car Seller' },
  { value: 'other', label: 'Other' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', phone: '',
    industry: '', tosAccepted: false,
  })

  const pwStrength = form.password.length === 0 ? null
    : form.password.length < 8 ? 'weak'
    : form.password.length < 12 ? 'fair'
    : 'strong'

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 12) return toast.error('Password must be at least 12 characters')
    if (!form.tosAccepted) return toast.error('Please accept the Terms of Service')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/check-email?email=${encodeURIComponent(form.email)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex w-5/12 mesh-bg flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl" />
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/40">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white">AutoAuditAI</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">Start protecting your fleet today</h2>
            <p className="text-slate-400 text-sm">Join rental businesses already saving thousands monthly.</p>
          </div>
          <div className="space-y-4">
            {[
              { icon: ScanLine, title: 'Guided photo capture', desc: '8-angle walkaround in 3 minutes' },
              { icon: Zap, title: 'AI damage detection', desc: 'Powered by Claude Vision AI' },
              { icon: BarChart3, title: 'Comparison reports', desc: 'Before/after in one click' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-9 h-9 bg-teal-500/15 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{title}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Shield className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-slate-400 text-xs">3 free inspections · No credit card required · Cancel anytime</span>
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10">© 2026 AutoAuditAI</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900">AutoAuditAI</span>
          </Link>

          <div className="mb-7">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 mt-1.5 text-sm">3 free inspections — no credit card needed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full name *</label>
                <input type="text" required value={form.name} onChange={f('name')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all"
                  placeholder="Ahmed Khan" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phone</label>
                <input type="tel" value={form.phone} onChange={f('phone')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all"
                  placeholder="+92 300..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Business name</label>
              <input type="text" value={form.businessName} onChange={f('businessName')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all"
                placeholder="Lahore Premium Rentals" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">I am a *</label>
              <select required value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all">
                <option value="">Select your use case…</option>
                {INDUSTRIES.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email address *</label>
              <input type="email" required value={form.email} onChange={f('email')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all"
                placeholder="you@business.com" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required minLength={12}
                  value={form.password} onChange={f('password')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all pr-10"
                  placeholder="Min. 12 characters" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwStrength && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1">
                    {['weak','fair','strong'].map((s, i) => (
                      <div key={s} className={`h-1 w-8 rounded-full ${
                        ['weak','fair','strong'].indexOf(pwStrength) >= i
                          ? pwStrength === 'weak' ? 'bg-red-400' : pwStrength === 'fair' ? 'bg-amber-400' : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium capitalize ${
                    pwStrength === 'weak' ? 'text-red-500' : pwStrength === 'fair' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>{pwStrength}</span>
                </div>
              )}
            </div>

            {/* ToS checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input type="checkbox" id="tos" required
                checked={form.tosAccepted}
                onChange={e => setForm(p => ({ ...p, tosAccepted: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-teal-600" />
              <label htmlFor="tos" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-teal-600 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-teal-600 hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-all shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-px mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
