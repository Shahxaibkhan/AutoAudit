import Link from 'next/link'
import { ScanLine, Shield, BarChart3, CheckCircle, ArrowRight, Zap, Star, ChevronRight, Gauge, Car, Building2, Truck, ShieldCheck, Wrench, FileText } from 'lucide-react'
import MobileNav from '@/components/MobileNav'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">AutoAuditAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Industries', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 hover:shadow-lg hover:-translate-y-px">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mesh-bg pt-24 sm:pt-32 pb-16 sm:pb-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-24 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            Powered by Claude Vision AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-5 sm:mb-6 leading-[1.08] sm:leading-[1.05] tracking-tight">
            Stop Losing Money<br className="hidden sm:block" />
            {' '}on{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Disputed Damage</span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered vehicle inspection for rentals, dealers, fleets, insurance, body shops, and leasing. Capture, detect damage, and compare before/after in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold hover:bg-teal-500 transition-all shadow-xl shadow-teal-500/25 hover:-translate-y-0.5">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold hover:bg-white/12 transition-all backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 flex-wrap">
            {['No credit card', 'Setup in 5 minutes', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-slate-500 text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-20 relative animate-float hidden sm:block">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl glow-teal">
            <div className="bg-slate-900/90 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-4 bg-slate-700/50 rounded-md h-6 flex items-center px-3">
                  <span className="text-slate-400 text-xs">app.autoauditai.com/dashboard</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-4 gap-3">
                {[
                  { label: 'Vehicles', val: '24', color: 'bg-teal-500/15 text-teal-300' },
                  { label: 'Inspections', val: '318', color: 'bg-indigo-500/15 text-indigo-300' },
                  { label: 'Completed', val: '291', color: 'bg-emerald-500/15 text-emerald-300' },
                  { label: 'Damages Found', val: '47', color: 'bg-amber-500/15 text-amber-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className={`inline-block text-xs px-2 py-0.5 rounded-md mb-2 ${s.color}`}>{s.label}</div>
                    <div className="text-2xl font-bold text-white">{s.val}</div>
                  </div>
                ))}
                <div className="col-span-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-300 font-medium">Recent Inspections</span>
                    <span className="text-xs text-teal-400">View all →</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { car: 'Toyota Corolla', plate: 'LHR-5521', type: 'POST RENTAL', badge: 'bg-emerald-500/15 text-emerald-300', dmg: '4 damages' },
                      { car: 'Honda Civic', plate: 'KHI-7743', type: 'PRE RENTAL', badge: 'bg-teal-500/15 text-teal-300', dmg: '1 damage' },
                    ].map(r => (
                      <div key={r.plate} className="flex items-center justify-between py-2 px-3 bg-white/3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-white/8 rounded-lg flex items-center justify-center">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{r.car}</div>
                            <div className="text-xs text-slate-500">{r.plate} · {r.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400">{r.dmg}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.badge}`}>COMPLETED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-teal-500/20 blur-2xl rounded-full pointer-events-none" />
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-8 sm:py-12 border-b border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-8">
            Trusted across industries in
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {['Pakistan 🇵🇰', 'Indonesia 🇮🇩', 'Malaysia 🇲🇾', 'UAE 🇦🇪', 'Saudi Arabia 🇸🇦'].map(c => (
              <span key={c} className="text-base font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-default">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-teal-600 text-xs font-bold uppercase tracking-widest mb-4">Why AutoAuditAI</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Everything you need to protect your fleet</h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">Stop disputes before they start. AI inspection takes 3 minutes and gives you bulletproof documentation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ScanLine,
                color: 'from-teal-500 to-teal-600',
                glow: 'shadow-teal-500/20',
                bg: 'group-hover:bg-teal-50',
                title: 'Guided Photo Capture',
                desc: '8-angle walkaround with live guidance. Front, rear, sides, and corners — systematically documented in under 3 minutes.',
                points: ['Works on any smartphone', 'No special equipment needed', 'Offline-ready capture'],
              },
              {
                icon: Zap,
                color: 'from-indigo-500 to-indigo-600',
                glow: 'shadow-indigo-500/20',
                bg: 'group-hover:bg-indigo-50',
                title: 'AI Damage Detection',
                desc: 'Claude Vision AI scans every photo for scratches, dents, cracks, and paint damage with detailed severity ratings.',
                points: ['Detects 6+ damage types', 'Severity scoring (minor → severe)', 'Repair cost estimates'],
              },
              {
                icon: BarChart3,
                color: 'from-emerald-500 to-emerald-600',
                glow: 'shadow-emerald-500/20',
                bg: 'group-hover:bg-emerald-50',
                title: 'Before/After Comparison',
                desc: 'Pre and post-inspections are compared automatically. Only new damage is flagged — no false accusations.',
                points: ['Auto-linked to pre-inspection', 'New damage highlighted', 'PDF report in one click'],
              },
            ].map(f => (
              <div key={f.title} className={`group relative bg-white rounded-2xl border border-slate-100 p-7 card-hover shadow-sm hover:border-slate-200 ${f.bg} transition-colors`}>
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-lg ${f.glow}`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section className="py-16 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-transparent" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$1,200', label: 'Avg saved per dispute' },
              { value: '3 min', label: 'Per full inspection' },
              { value: '94%', label: 'AI accuracy rate' },
              { value: '10k+', label: 'Inspections monthly' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-teal-400/70 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="industries" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="inline-block text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">Industries</span>
            <h2 className="text-4xl font-black text-white tracking-tight">Built for every vehicle business</h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
              One platform, six industries. Try a live demo tailored to your use case.
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
                points: ['Drop-off vs pick-up audit', 'Transparent repair cost proof', 'Customer sign-off'],
              },
              {
                key: 'leasing', icon: FileText, color: 'from-rose-500 to-rose-600', glow: 'shadow-rose-500/20',
                label: 'Leasing', border: 'hover:border-rose-500/30',
                points: ['Lease-start condition baseline', 'Lease-end excess wear charges', 'Legal-grade documentation'],
              },
            ].map(ind => (
              <div key={ind.key} className={`group bg-white/5 border border-white/8 ${ind.border} rounded-2xl p-6 transition-all hover:bg-white/8`}>
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
                <Link
                  href={`/demo?industry=${ind.key}`}
                  className="inline-flex items-center gap-1.5 text-teal-400 text-sm font-semibold group-hover:gap-2.5 transition-all"
                >
                  Try {ind.label} demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-teal-600 text-xs font-bold uppercase tracking-widest mb-4">Process</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">From inspection to report in minutes</h2>
          </div>

          <div className="space-y-4">
            {[
              { n: '01', title: 'Add your vehicle', desc: 'Enter make, model, year, and license plate. Takes 30 seconds per car.' },
              { n: '02', title: 'Capture pre-inspection photos', desc: 'Follow the guided 8-angle walkthrough on your phone. All angles documented.' },
              { n: '03', title: 'AI analyzes & reports', desc: 'Claude Vision detects every scratch, dent, and paint chip. Timestamped PDF generated instantly.' },
              { n: '04', title: 'Compare on return', desc: 'Post-inspection is automatically compared. New damage flagged with repair cost estimate.' },
            ].map((step) => (
              <div key={step.n} className="flex gap-6 items-start bg-white rounded-2xl p-6 border border-slate-100 shadow-sm group hover:border-teal-100 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-teal-500/20">
                  {step.n}
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-teal-400 transition-colors mt-1 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
          </div>
          <blockquote className="text-2xl font-bold text-slate-900 leading-snug mb-6">
            &ldquo;Before AutoAuditAI we lost PKR 80,000 in a single dispute we couldn&apos;t prove. Now every rental is documented. We&apos;ve had zero unresolved disputes in 6 months.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AK</div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-900">Ahmed Khan</div>
              <div className="text-xs text-slate-400">Owner, Capital Rentals — Islamabad</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-teal-600 text-xs font-bold uppercase tracking-widest mb-4">Pricing</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pay per inspection, not per seat</h2>
            <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
              Buy monthly inspection credits. Use them for any vehicle, any industry. Unused credits roll over.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
            {[
              {
                name: 'Starter',
                price: '$19',
                period: '/mo',
                inspections: '50 inspections',
                desc: 'Perfect for small fleets and solo operators.',
                features: ['50 inspection credits/mo', 'AI damage detection', 'PDF reports', 'Email support'],
                cta: 'Start free trial',
                highlight: false,
              },
              {
                name: 'Growth',
                price: '$49',
                period: '/mo',
                inspections: '200 inspections',
                desc: 'For growing rental or fleet businesses.',
                features: ['200 inspection credits/mo', 'Before/after comparison', 'Multi-vehicle dashboard', 'Priority support'],
                cta: 'Start free trial',
                highlight: true,
              },
              {
                name: 'Pro',
                price: '$99',
                period: '/mo',
                inspections: '600 inspections',
                desc: 'High-volume operations and multi-branch businesses.',
                features: ['600 inspection credits/mo', 'All Growth features', 'API access', 'Dedicated onboarding'],
                cta: 'Start free trial',
                highlight: false,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                inspections: 'Unlimited',
                desc: 'Large fleets, insurance firms, and dealership groups.',
                features: ['Unlimited inspections', 'White-label option', 'Custom integrations', 'SLA + dedicated support'],
                cta: 'Contact sales',
                highlight: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all ${
                  plan.highlight
                    ? 'bg-teal-600 border-teal-500 shadow-xl shadow-teal-500/20 ring-2 ring-teal-400/30'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-5">
                  <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-teal-100' : 'text-slate-400'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-teal-200' : 'text-slate-400'}`}>{plan.period}</span>
                  </div>
                  <div className={`text-sm font-semibold mt-1 ${plan.highlight ? 'text-teal-100' : 'text-teal-600'}`}>
                    {plan.inspections}
                  </div>
                  <p className={`text-sm mt-2 leading-snug ${plan.highlight ? 'text-teal-100' : 'text-slate-500'}`}>{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-teal-200' : 'text-teal-500'}`} />
                      <span className={plan.highlight ? 'text-teal-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === 'Enterprise' ? '/login' : '/register'}
                  className={`block text-center py-2.5 rounded-xl text-sm font-bold transition-all ${
                    plan.highlight
                      ? 'bg-white text-teal-700 hover:bg-teal-50'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Start protecting your fleet today</h2>
          <p className="text-slate-400 mb-8 text-base sm:text-lg">Join thousands of vehicle businesses using AI to eliminate damage disputes.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold hover:bg-teal-500 transition-all shadow-xl shadow-teal-500/25 hover:-translate-y-0.5">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold hover:bg-white/12 transition-all">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Try live demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">AutoAuditAI</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 AutoAuditAI. AI-powered vehicle damage detection.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
