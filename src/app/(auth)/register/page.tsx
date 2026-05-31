'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ScanLine, Loader2, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '', phone: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Account created!')
      router.push('/login')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

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
            <span className="text-slate-400 text-xs">14-day free trial · No credit card required · Cancel anytime</span>
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
            <p className="text-slate-500 mt-1.5 text-sm">Free 14-day trial — no credit card needed</p>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email address *</label>
              <input type="email" required value={form.email} onChange={f('email')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all"
                placeholder="you@business.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password *</label>
              <input type="password" required minLength={8} value={form.password} onChange={f('password')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all"
                placeholder="Min. 8 characters" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-all shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-px mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
            By signing up you agree to our{' '}
            <a href="#" className="text-teal-600 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>.
          </p>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
