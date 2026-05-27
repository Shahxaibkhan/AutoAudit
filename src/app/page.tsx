import Link from 'next/link'
import { Camera, Shield, BarChart3, CheckCircle, ArrowRight, Zap, Star, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">CarPect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Pricing'].map(l => (
              <a key={l} href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-px">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mesh-bg pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Orb accents */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            Powered by Claude Vision AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
            Stop Losing Money<br />
            on{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Disputed Damage</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered car inspection for rental businesses. Capture, detect damage, and compare before/after in minutes — not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/15 transition-all backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live demo
            </Link>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {['No credit card', 'Setup in 5 minutes', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-gray-500 text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="max-w-5xl mx-auto mt-16 relative animate-float">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl">
            <div className="bg-gray-900/80 rounded-xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/60 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-4 bg-gray-700/50 rounded-md h-6 flex items-center px-3">
                  <span className="text-gray-400 text-xs">app.carpect.com/dashboard</span>
                </div>
              </div>
              {/* Fake dashboard */}
              <div className="p-6 grid grid-cols-4 gap-3">
                {[
                  { label: 'Vehicles', val: '24', color: 'bg-blue-500/20 text-blue-300' },
                  { label: 'Inspections', val: '318', color: 'bg-violet-500/20 text-violet-300' },
                  { label: 'Completed', val: '291', color: 'bg-green-500/20 text-green-300' },
                  { label: 'Damages Found', val: '47', color: 'bg-orange-500/20 text-orange-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className={`inline-block text-xs px-2 py-0.5 rounded-md mb-2 ${s.color}`}>{s.label}</div>
                    <div className="text-2xl font-bold text-white">{s.val}</div>
                  </div>
                ))}
                <div className="col-span-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-300 font-medium">Recent Inspections</span>
                    <span className="text-xs text-blue-400">View all →</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { car: 'Toyota Corolla', plate: 'LHR-5521', type: 'POST RENTAL', status: 'COMPLETED', badge: 'bg-green-500/20 text-green-300', dmg: '4 damages' },
                      { car: 'Honda Civic', plate: 'KHI-7743', type: 'PRE RENTAL', status: 'COMPLETED', badge: 'bg-blue-500/20 text-blue-300', dmg: '1 damage' },
                    ].map(r => (
                      <div key={r.plate} className="flex items-center justify-between py-2 px-3 bg-white/3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{r.car}</div>
                            <div className="text-xs text-gray-500">{r.plate} · {r.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-400">{r.dmg}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.badge}`}>{r.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-blue-600/30 blur-2xl rounded-full pointer-events-none" />
        </div>
      </section>

      {/* ── LOGOS / SOCIAL PROOF ── */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-8">
            Built for rental businesses across
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['Pakistan 🇵🇰', 'Indonesia 🇮🇩', 'Malaysia 🇲🇾', 'UAE 🇦🇪', 'Saudi Arabia 🇸🇦'].map(c => (
              <span key={c} className="text-base font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-default">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Why CarPect</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Everything you need to protect your fleet</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">Stop disputes before they start. AI inspection takes 3 minutes and gives you bulletproof documentation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                color: 'from-blue-500 to-blue-600',
                glow: 'shadow-blue-500/20',
                title: 'Guided Photo Capture',
                desc: '8-angle walkaround with live guidance. Front, rear, sides, and corners — systematically documented in under 3 minutes.',
                points: ['Works on any smartphone', 'No special equipment needed', 'Offline-ready capture'],
              },
              {
                icon: Zap,
                color: 'from-violet-500 to-violet-600',
                glow: 'shadow-violet-500/20',
                title: 'AI Damage Detection',
                desc: 'Claude Vision AI scans every photo for scratches, dents, cracks, and paint damage with detailed severity ratings.',
                points: ['Detects 6+ damage types', 'Severity scoring (minor → severe)', 'Repair cost estimates'],
              },
              {
                icon: BarChart3,
                color: 'from-emerald-500 to-emerald-600',
                glow: 'shadow-emerald-500/20',
                title: 'Before/After Comparison',
                desc: 'Pre and post-rental inspections are compared automatically. Only new damage is flagged — no false accusations.',
                points: ['Auto-linked to pre-rental', 'New damage highlighted in red', 'PDF report in one click'],
              },
            ].map(f => (
              <div key={f.title} className="group relative bg-white rounded-2xl border border-gray-100 p-7 card-hover shadow-sm hover:border-gray-200">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-lg ${f.glow}`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
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
      <section className="py-16 bg-gradient-to-br from-blue-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
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
                <div className="text-blue-200 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Process</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">From inspection to report in minutes</h2>
          </div>

          <div className="space-y-4">
            {[
              { n: '01', title: 'Add your vehicle', desc: 'Enter make, model, year, and license plate. Takes 30 seconds per car.' },
              { n: '02', title: 'Capture pre-rental photos', desc: 'Follow the guided 8-angle walkthrough on your phone. All angles documented.' },
              { n: '03', title: 'AI analyzes & reports', desc: 'Claude Vision detects every scratch, dent, and paint chip. Timestamped PDF generated instantly.' },
              { n: '04', title: 'Compare on return', desc: 'Post-rental inspection is automatically compared. New damage flagged in red with repair cost estimate.' },
            ].map((step, i) => (
              <div key={step.n} className="flex gap-6 items-start bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group hover:border-blue-100 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/20">
                  {step.n}
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-blue-400 transition-colors mt-1 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
          </div>
          <blockquote className="text-2xl font-bold text-gray-900 leading-snug mb-6">
            &ldquo;Before CarPect we lost PKR 80,000 in a single dispute we couldn&apos;t prove. Now every rental is documented. We&apos;ve had zero unresolved disputes in 6 months.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AK</div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">Ahmed Khan</div>
              <div className="text-xs text-gray-400">Owner, Capital Rentals — Islamabad</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Simple, affordable pricing</h2>
          <p className="text-gray-500 mb-8">Starting at <strong className="text-gray-900">$29/month</strong> for up to 20 vehicles. No per-inspection fees.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5">
              Start free 14-day trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              See live demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">CarPect</span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 CarPect. AI-powered car damage detection.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
