'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ScanLine, Shield, BarChart3, CheckCircle, ArrowRight, Zap, Star,
  Car, Building2, Truck, ShieldCheck, Wrench, FileText,
  Lock, Eye, ChevronDown, MessageCircle, Phone, Users,
  TrendingUp, Clock, Camera, FileCheck
} from 'lucide-react'
import MobileNav from '@/components/MobileNav'
import LanguageToggle from '@/components/LanguageToggle'
import { useI18n } from '@/lib/i18n'

/* ─── tiny helpers ─────────────────────────────────────────────────────── */

function SectionLabel({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-4">
      <div className={`h-px w-8 ${dark ? 'bg-teal-500/60' : 'bg-teal-500'}`} />
      <span className={`text-xs font-bold uppercase tracking-[0.15em] ${dark ? 'text-teal-400' : 'text-teal-600'}`}>
        {children}
      </span>
      <div className={`h-px w-8 ${dark ? 'bg-teal-500/60' : 'bg-teal-500'}`} />
    </div>
  )
}

/* ─── page ─────────────────────────────────────────────────────────────── */

/* ─── Pricing section with B2C / B2B toggle ──────────────────────── */
function PricingSection() {
  const [tab, setTab] = useState<'b2c' | 'b2b'>('b2c')

  const b2cPlans = [
    { name: 'Quick Check', price: '$0.99', period: '/inspection', badge: null, desc: 'Fast AI screening — good for a quick look.', features: ['AI damage detection', 'Condition grade A–F', 'Evidence photos', 'Shareable report'], cta: 'Get started', highlight: false },
    { name: 'Standard', price: '$1.99', period: '/inspection', badge: 'Most popular', desc: 'Full report for buyers, sellers, and personal checks.', features: ['Everything in Quick', 'Panel-by-panel breakdown', 'Repaint & rim detection', 'PDF download'], cta: 'Get started', highlight: true },
    { name: 'Pro', price: '$3.99', period: '/inspection', badge: null, desc: 'Advanced analysis including hidden damage indicators.', features: ['Everything in Standard', 'Panel misalignment detection', 'Headlight clarity check', 'Priority AI processing'], cta: 'Get started', highlight: false },
    { name: 'With Signatures', price: '$4.99', period: '/inspection', badge: null, desc: 'Both parties sign. SHA-256 tamper-proof seal.', features: ['Everything in Pro', 'Owner reviews findings', 'Customer signs agreement', 'SHA-256 verification hash'], cta: 'Get started', highlight: false },
  ]

  const b2bPlans = [
    { name: 'Starter', price: 'From $19', period: '/mo', badge: null, desc: 'Perfect for small fleets and solo operators.', features: ['50 inspection credits', 'AI damage detection', 'PDF reports', 'Email support'], cta: 'Start free trial', highlight: false },
    { name: 'Growth', price: 'From $49', period: '/mo', badge: 'Most popular', desc: 'For growing rental or fleet businesses.', features: ['200 inspection credits', 'Before/after comparison', 'Multi-vehicle dashboard', 'Priority support'], cta: 'Start free trial', highlight: true },
    { name: 'Pro', price: 'From $99', period: '/mo', badge: null, desc: 'High-volume operations and multi-branch businesses.', features: ['600 inspection credits', 'All Growth features', 'API access', 'Dedicated onboarding'], cta: 'Start free trial', highlight: false },
    { name: 'Enterprise', price: 'Custom', period: '', badge: null, desc: 'Large fleets, insurers, and dealership groups.', features: ['Unlimited inspections', 'White-label option', 'Custom integrations', 'SLA + dedicated support'], cta: 'Contact sales', highlight: false },
  ]

  const plans = tab === 'b2c' ? b2cPlans : b2bPlans

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <SectionLabel dark>Pricing</SectionLabel>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
          Pay only when<br className="hidden sm:block" /> you inspect
        </h2>

        {/* Toggle */}
        <div className="inline-flex bg-white/6 border border-white/10 rounded-2xl p-1.5 gap-1">
          <button onClick={() => setTab('b2c')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'b2c' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25' : 'text-slate-400 hover:text-white'}`}>
            👤 Individual
          </button>
          <button onClick={() => setTab('b2b')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'b2b' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}>
            🏢 Business
          </button>
        </div>

        <p className="mt-4 text-slate-400 text-base max-w-xl mx-auto">
          {tab === 'b2c'
            ? 'Pay per inspection. No subscription needed. Perfect for buyers, sellers, and personal checks.'
            : 'Monthly credits for your fleet or business. No per-user fees. Cancel anytime.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map(plan => (
          <div key={plan.name}
            className={`relative rounded-2xl p-6 border transition-all ${
              plan.highlight
                ? tab === 'b2c' ? 'bg-teal-500 border-teal-400 shadow-2xl shadow-teal-500/25' : 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-500/25'
                : 'bg-white/4 border-white/8 hover:bg-white/6 hover:border-white/15'
            }`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}
            <div className="mb-5">
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-white/70' : 'text-slate-500'}`}>{plan.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-slate-500'}`}>{plan.period}</span>
              </div>
              <p className={`text-xs mt-2 leading-snug ${plan.highlight ? 'text-white/70' : 'text-slate-500'}`}>{plan.desc}</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-white/60' : 'text-teal-500'}`} />
                  <span className={plan.highlight ? 'text-white/80' : 'text-slate-400'}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href={plan.name === 'Enterprise' ? '/login' : '/register'}
              className={`block text-center py-2.5 rounded-xl text-sm font-bold transition-all ${
                plan.highlight
                  ? 'bg-slate-950 text-white hover:bg-slate-900'
                  : tab === 'b2c' ? 'bg-teal-500 text-slate-950 hover:bg-teal-400' : 'bg-indigo-500 text-white hover:bg-indigo-400'
              }`}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-slate-600 text-sm">
        {tab === 'b2c'
          ? '3 free inspections to start · No credit card required · Pay only when you need it'
          : 'All plans include a 14-day free trial · 3 free inspections · No credit card required'}
      </p>
    </div>
  )
}

export default function LandingPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black text-white tracking-tight">AutoAuditAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How it works' },
              { href: '#pricing', label: 'Pricing' },
              { href: '#faq', label: 'FAQ' },
            ].map(({ href, label }) => (
              <a key={label} href={href}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/5">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle dark />
            <Link href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 bg-teal-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20">
              Start free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-32 px-4 sm:px-6 overflow-hidden bg-slate-950">
        {/* Car photo background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1966&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25 pointer-events-none select-none"
          aria-hidden="true"
        />
        {/* Gradient overlay: dark at top/bottom, slightly lighter at center */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/90 pointer-events-none" />
        {/* Ambient teal glow */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-teal-500/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 border border-teal-500/25 bg-teal-500/8 text-teal-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            {t('hero.badge')}
            <span className="text-teal-500/60">·</span>
            <span className="text-teal-400/70">🌍</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-black text-white mb-6 leading-[1.03] tracking-tight">
            {t('hero.title1')}<br />
            {t('hero.title2').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{t('hero.title2').split(' ').slice(-1)[0]}</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-teal-500 text-slate-950 px-7 py-4 rounded-2xl text-base font-bold hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/25 hover:-translate-y-0.5">
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo"
              className="inline-flex items-center justify-center gap-2 bg-white/6 border border-white/12 text-white px-7 py-4 rounded-2xl text-base font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {t('hero.demo')}
            </Link>
          </div>

          <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
            {[
              { icon: Lock, text: 'Anonymous — sellers never see you' },
              { icon: CheckCircle, text: 'No credit card required' },
              { icon: Clock, text: 'Results in 3 minutes' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-slate-500 text-sm">
                <Icon className="w-3.5 h-3.5 text-teal-500/70 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Three audience tiles */}
        <div className="max-w-5xl mx-auto mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Eye,
              label: t('tiles.buyer.label'),
              title: t('tiles.buyer.title'),
              desc: t('tiles.buyer.desc'),
              color: 'from-teal-500/20 to-teal-500/5',
              border: 'border-teal-500/20',
              iconColor: 'text-teal-400',
              iconBg: 'bg-teal-500/10',
            },
            {
              icon: TrendingUp,
              label: t('tiles.seller.label'),
              title: t('tiles.seller.title'),
              desc: t('tiles.seller.desc'),
              color: 'from-amber-500/15 to-amber-500/3',
              border: 'border-amber-500/20',
              iconColor: 'text-amber-400',
              iconBg: 'bg-amber-500/10',
            },
            {
              icon: Building2,
              label: t('tiles.business.label'),
              title: t('tiles.business.title'),
              desc: t('tiles.business.desc'),
              color: 'from-indigo-500/15 to-indigo-500/3',
              border: 'border-indigo-500/20',
              iconColor: 'text-indigo-400',
              iconBg: 'bg-indigo-500/10',
            },
          ].map(tile => (
            <div key={tile.label}
              className={`relative bg-white/6 backdrop-blur-md border ${tile.border} rounded-2xl p-6 shadow-xl shadow-black/30 hover:bg-white/9 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
              {/* Subtle inner gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} opacity-60 pointer-events-none rounded-2xl`} />
              <div className="relative">
                <div className={`w-10 h-10 ${tile.iconBg} rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm`}>
                  <tile.icon className={`w-5 h-5 ${tile.iconColor}`} />
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{tile.label}</div>
                <h3 className="text-white font-bold text-base mb-2">{tile.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{tile.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto mt-16 relative animate-float hidden sm:block">
          <div className="bg-white/6 backdrop-blur-sm border border-white/15 rounded-2xl p-1 shadow-2xl shadow-black/50 glow-teal ring-1 ring-inset ring-white/8">
            <div className="bg-slate-900/95 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/70 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 bg-slate-700/40 rounded-md h-6 flex items-center px-3">
                  <span className="text-slate-500 text-xs">app.autoauditai.com/dashboard</span>
                </div>
              </div>
              <div className="p-5 grid grid-cols-4 gap-3">
                {[
                  { label: 'Vehicles', val: '24', color: 'bg-teal-500/12 text-teal-300' },
                  { label: 'Inspections', val: '318', color: 'bg-indigo-500/12 text-indigo-300' },
                  { label: 'Completed', val: '291', color: 'bg-emerald-500/12 text-emerald-300' },
                  { label: 'Disputes Won', val: '47', color: 'bg-amber-500/12 text-amber-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/4 rounded-xl p-4 border border-white/5">
                    <div className={`inline-block text-xs px-2 py-0.5 rounded-md mb-2 font-medium ${s.color}`}>{s.label}</div>
                    <div className="text-2xl font-black text-white">{s.val}</div>
                  </div>
                ))}
                <div className="col-span-4 bg-white/4 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-300 font-semibold">Recent Inspections</span>
                    <span className="text-xs text-teal-400 font-medium">View all →</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { car: 'Toyota Corolla 2020', plate: 'LHR-5521', type: 'POST RENTAL', badge: 'bg-emerald-500/12 text-emerald-300', dmg: '4 damages' },
                      { car: 'Honda Civic 2019', plate: 'KHI-7743', type: 'PRE RENTAL', badge: 'bg-teal-500/12 text-teal-300', dmg: 'Clean' },
                    ].map(r => (
                      <div key={r.plate} className="flex items-center justify-between py-2.5 px-3 bg-white/3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-white/6 rounded-lg flex items-center justify-center">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{r.car}</div>
                            <div className="text-xs text-slate-500">{r.plate} · {r.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400 font-medium">{r.dmg}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.badge}`}>DONE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-teal-500/15 blur-3xl rounded-full pointer-events-none" />
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="py-14 bg-white border-y border-slate-100 dot-grid relative">
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$500+', label: 'avg dispute value saved', sub: 'per rental incident' },
              { value: '3 min', label: 'video or photo inspection', sub: 'on any smartphone' },
              { value: '8+', label: 'damage types detected', sub: 'incl. repaint & rim damage' },
              { value: '100%', label: 'mobile-first design', sub: 'works on any phone' },
            ].map(s => (
              <div key={s.label} className="group">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">{s.value}</div>
                <div className="text-slate-700 text-sm font-semibold">{s.label}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-950 dot-grid-dark relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-teal-950/5 to-slate-950/0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <SectionLabel dark>Core capabilities</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Everything you need<br className="hidden sm:block" /> to prove the truth
            </h2>
            <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Stop disputes before they start. AI inspection takes 3 minutes and gives you bulletproof documentation accepted by courts and insurers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Camera,
                color: 'from-teal-500 to-teal-600',
                glow: 'shadow-teal-500/25',
                border: 'hover:border-teal-500/30',
                title: 'Video or Photo Capture',
                desc: 'Record a 60-second video walkaround and let AI extract the best frames automatically — or use guided 8-angle photos. Both modes work on any smartphone.',
                points: ['Video mode: AI picks best 35 frames', '8-photo guided mode as fallback', 'Blur & quality filtering built in'],
              },
              {
                icon: Zap,
                color: 'from-indigo-500 to-indigo-600',
                glow: 'shadow-indigo-500/25',
                border: 'hover:border-indigo-500/30',
                title: 'AI Damage Detection',
                desc: 'Claude Vision AI scans every photo for scratches, dents, cracks, and paint damage. Each finding gets a severity rating and repair cost estimate.',
                points: ['Detects 6+ damage types', 'Severity scoring (minor → severe)', 'Repair cost estimates in local currency'],
              },
              {
                icon: FileCheck,
                color: 'from-emerald-500 to-emerald-600',
                glow: 'shadow-emerald-500/25',
                border: 'hover:border-emerald-500/30',
                title: 'Before/After Comparison',
                desc: 'Pre and post-inspections are compared automatically. Only new damage is flagged — no false accusations. Timestamped PDF in one click.',
                points: ['Auto-linked to pre-inspection', 'New damage highlighted clearly', 'Legal-grade PDF report'],
              },
            ].map(f => (
              <div key={f.title}
                className={`group relative bg-white/6 backdrop-blur-md border border-white/12 ${f.border} rounded-2xl p-7 transition-all duration-200 hover:bg-white/9 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 shadow-lg shadow-black/20`}>
                {/* Top edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-lg ${f.glow}`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust signals row */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: 'Anonymous inspection', desc: 'Buyers inspect in complete privacy. Sellers never see who checked their vehicle.' },
              { icon: Shield, title: 'Backed by dual signatures', desc: 'Owner reviews AI findings, customer confirms. Both parties sign and the report is locked with a SHA-256 hash — tamper-proof forever.' },
              { icon: Users, title: 'Trusted by businesses', desc: 'Rental companies, dealers, and fleet managers rely on AutoAuditAI to eliminate damage disputes.' },
            ].map(t => (
              <div key={t.title} className="flex gap-4 bg-white/6 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-md shadow-black/20">
                <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <t.icon className="w-4.5 h-4.5 text-teal-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">{t.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-white dot-grid relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Inspection to report<br className="hidden sm:block" /> in 4 steps
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                n: '01',
                title: 'Add your vehicle',
                desc: 'Enter make, model, year, and license plate. 30 seconds per car. Works for any vehicle type.',
                color: 'from-teal-600 to-cyan-600',
              },
              {
                n: '02',
                title: 'Record a video or take 8 photos',
                desc: 'Walk around the car for 60 seconds while recording — AI automatically extracts the sharpest, most distinct frames. Prefer photos? A guided 8-angle mode has you covered too.',
                color: 'from-indigo-600 to-indigo-700',
              },
              {
                n: '03',
                title: 'AI generates the report',
                desc: 'Claude Vision detects every scratch, dent, and paint chip. A timestamped, signed PDF is generated instantly — ready to share or store.',
                color: 'from-emerald-600 to-teal-600',
              },
              {
                n: '04',
                title: 'Compare on return',
                desc: 'The post-inspection is automatically compared against the pre-inspection. Only new damage is flagged, with repair cost estimates. Zero ambiguity.',
                color: 'from-amber-500 to-orange-500',
              },
            ].map((step) => (
              <div key={step.n}
                className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-slate-100 shadow-sm group hover:border-teal-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg`}>
                  {step.n}
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-bold text-slate-900 mb-1.5 text-base">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-teal-400 transition-colors mt-2 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ──────────────────────────────────────────────────── */}
      <section id="industries" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <SectionLabel dark>Industries</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Built for every vehicle business
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
              One platform, six use cases. Try a live demo tailored to your industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: 'rental', icon: Car, color: 'from-teal-500 to-teal-600', glow: 'shadow-teal-500/20',
                label: 'Car Rentals', border: 'hover:border-teal-500/30',
                points: ['Pre/post-rental comparison', 'Dispute-proof documentation', 'Renter sign-off receipts'],
              },
              {
                key: 'dealer', icon: Building2, color: 'from-indigo-500 to-indigo-600', glow: 'shadow-indigo-500/20',
                label: 'Dealerships', border: 'hover:border-indigo-500/30',
                points: ['Pre-sale condition reports', 'Trade-in damage records', 'Build buyer confidence'],
              },
              {
                key: 'fleet', icon: Truck, color: 'from-cyan-500 to-cyan-600', glow: 'shadow-cyan-500/20',
                label: 'Fleet Managers', border: 'hover:border-cyan-500/30',
                points: ['Shift-start / shift-end checks', 'Driver accountability trail', 'Multi-vehicle dashboard'],
              },
              {
                key: 'insurance', icon: ShieldCheck, color: 'from-violet-500 to-violet-600', glow: 'shadow-violet-500/20',
                label: 'Insurance', border: 'hover:border-violet-500/30',
                points: ['Pre/post-claim evidence', 'Faster claim processing', 'Reduce fraudulent claims'],
              },
              {
                key: 'bodyshop', icon: Wrench, color: 'from-amber-500 to-amber-600', glow: 'shadow-amber-500/20',
                label: 'Body Shops', border: 'hover:border-amber-500/30',
                points: ['Drop-off vs pick-up audit', 'Transparent repair cost proof', 'Customer sign-off flow'],
              },
              {
                key: 'leasing', icon: FileText, color: 'from-rose-500 to-rose-600', glow: 'shadow-rose-500/20',
                label: 'Leasing', border: 'hover:border-rose-500/30',
                points: ['Lease-start condition baseline', 'Lease-end excess wear charges', 'Legal-grade documentation'],
              },
            ].map(ind => (
              <div key={ind.key}
                className={`group bg-white/4 border border-white/8 ${ind.border} rounded-2xl p-6 transition-all hover:bg-white/6`}>
                <div className={`w-11 h-11 bg-gradient-to-br ${ind.color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${ind.glow}`}>
                  <ind.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-3">{ind.label}</h3>
                <ul className="space-y-1.5 mb-5">
                  {ind.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-slate-400 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href={`/demo?industry=${ind.key}`}
                  className="inline-flex items-center gap-1.5 text-teal-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                  Try {ind.label} demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel dark>Customer stories</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Why businesses trust AutoAuditAI
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
              From solo rental owners to multi-branch dealerships — here&apos;s what changed when they started inspecting with AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "We used to argue about damage every week. Now the renter signs the inspection report before taking the car. Zero disputes in 4 months.",
                name: "Ahmed K.",
                role: "Car Rental Owner",
                initials: "AK",
                color: "from-teal-500 to-cyan-600",
                tag: "Rental",
              },
              {
                quote: "I was about to buy a used sedan that looked fine. AutoAuditAI flagged a repainted front quarter panel — classic accident cover-up. Saved me from a bad deal.",
                name: "Sara M.",
                role: "Used Car Buyer",
                initials: "SM",
                color: "from-amber-500 to-orange-600",
                tag: "Buyer",
              },
              {
                quote: "We manage 34 fleet vehicles. The shift-start/end inspection trail means drivers are accountable. Our insurance claims dropped because we have proof every time.",
                name: "Tariq R.",
                role: "Fleet Manager",
                initials: "TR",
                color: "from-indigo-500 to-violet-600",
                tag: "Fleet",
              },
            ].map(t => (
              <div key={t.name} className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all hover:-translate-y-0.5">
                {/* Top border glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-4 bg-gradient-to-r ${t.color} text-white`}>
                  {t.tag}
                </span>
                <blockquote className="text-slate-300 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <div className={`w-9 h-9 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-700 mt-6">Illustrative examples based on typical customer outcomes</p>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-950 dot-grid-dark">
        <PricingSection />
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 bg-white dot-grid">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Common questions
            </h2>
          </div>
          <div className="space-y-2">
            {[
              {
                q: 'Is my inspection completely anonymous?',
                a: 'Yes. If you are a buyer inspecting a vehicle, the seller never sees who ran the report. Your identity is fully private. This is designed specifically for pre-purchase inspections where you don\'t want to reveal interest to the seller.',
              },
              {
                q: 'How accurate is the AI damage detection?',
                a: 'AutoAuditAI uses Anthropic\'s Claude Vision model — one of the most capable AI vision systems available. It detects scratches, dents, cracks, paint chips, rust, and panel misalignments. You always see the raw photos alongside the AI analysis so you can verify every finding yourself.',
              },
              {
                q: 'What happens during the free trial?',
                a: 'You get 3 free inspection credits when you sign up — no credit card required. Each credit covers one full AI-analyzed inspection with a PDF report. After 3 inspections, or after 14 days, you can upgrade to a paid plan.',
              },
              {
                q: 'Can I use this on my phone?',
                a: 'Yes. AutoAuditAI is fully mobile-optimized. Record a 60-second video walkaround or take 8 guided photos — all from your smartphone browser. No app download required. Android and iOS both supported.',
              },
              {
                q: 'Is the PDF report legally valid?',
                a: 'The PDF report includes timestamps, GPS metadata from photos, and vehicle details. It has been used successfully in dispute resolution cases. While we cannot provide legal advice, rental companies report it is accepted as supporting documentation in formal disputes.',
              },
              {
                q: 'Do you support multiple languages and local currencies?',
                a: 'The platform supports English and Urdu, with Bahasa Indonesia, Bahasa Malaysia, and Arabic coming soon. Repair costs are shown in your local currency based on your language setting. Use the language toggle in the top navigation to switch.',
              },
              {
                q: 'What if I want a custom plan or volume pricing?',
                a: 'Contact us directly via WhatsApp (+92-343-4994409) or through the Enterprise pricing option above. We offer custom pricing for large fleets, insurance companies, and multi-branch dealerships.',
              },
            ].map((faq) => (
              <details key={faq.q} className="group border border-slate-200 rounded-2xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none">
                  <span className="font-semibold text-slate-900 text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/15 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-teal-500/8 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <SectionLabel dark>Get started</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            Start protecting<br className="hidden sm:block" /> your vehicles today
          </h2>
          <p className="text-slate-400 mb-10 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join businesses worldwide using AI to eliminate damage disputes.
            3 free inspections, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-teal-500 text-slate-950 px-8 py-4 rounded-2xl text-base font-bold hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/25 hover:-translate-y-0.5">
              Start free — 3 inspections <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sample-report"
              className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/12 transition-all">
              📄 View sample report
            </Link>
            <a href="https://wa.me/923434994409"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-8 py-4 rounded-2xl text-base font-semibold hover:bg-[#25D366]/15 transition-all">
              <MessageCircle className="w-4 h-4" />
              WhatsApp us
            </a>
          </div>
          <p className="text-slate-600 text-sm">
            Prefer a call?{' '}
            <a href="tel:+923434994409" className="text-slate-400 hover:text-white transition-colors font-medium">
              +92-343-4994409
            </a>
            {' '}· Typically responds within 1 hour
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-white/6 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                  <ScanLine className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white font-black text-sm tracking-tight">AutoAuditAI</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                The world&apos;s most trusted AI vehicle inspection platform — for buyers, sellers, and businesses.
              </p>
              <a href="https://wa.me/923434994409"
                className="inline-flex items-center gap-2 mt-4 text-xs text-[#25D366]/80 hover:text-[#25D366] transition-colors font-medium">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>

            {/* Product */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Product</div>
              <div className="space-y-2.5">
                {[
                  { href: '#features', label: 'Features' },
                  { href: '#how-it-works', label: 'How it works' },
                  { href: '#pricing', label: 'Pricing' },
                  { href: '#faq', label: 'FAQ' },
                  { href: '/demo', label: 'Live demo' },
                  { href: '/sample-report', label: 'Sample report' },
                ].map(({ href, label }) => (
                  <a key={label} href={href} className="block text-slate-500 hover:text-slate-300 text-sm transition-colors">{label}</a>
                ))}
              </div>
            </div>

            {/* Use cases */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Use cases</div>
              <div className="space-y-2.5">
                {['Car Rentals', 'Dealerships', 'Fleet Managers', 'Insurance', 'Body Shops', 'Leasing'].map(l => (
                  <a key={l} href="#industries" className="block text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Contact</div>
              <div className="space-y-2.5">
                <a href="https://wa.me/923434994409"
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <a href="tel:+923434994409"
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  +92-343-4994409
                </a>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <span>🌍</span> Available worldwide
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">© 2026 AutoAuditAI. All rights reserved.</p>
            <div className="flex gap-6">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: 'https://wa.me/923434994409', label: 'Contact' },
              ].map(({ href, label }) => (
                <a key={label} href={href} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
