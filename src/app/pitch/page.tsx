'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, ScanLine } from 'lucide-react'

/* ─── Animated counter hook ──────────────────────────────────────────── */
function useCounter(target: number, active: boolean, duration = 1500) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return value
}

/* ─── Particle background ────────────────────────────────────────────── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(60)].map((_, i) => (
        <div key={i}
          className="absolute rounded-full bg-teal-400"
          style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.4 + 0.1,
            animation: `float ${Math.random() * 8 + 4}s ease-in-out ${Math.random() * 4}s infinite alternate`,
          }} />
      ))}
    </div>
  )
}

/* ─── Grid background ────────────────────────────────────────────────── */
function GridBg({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `linear-gradient(rgba(20,184,166,${opacity}) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,${opacity}) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
  )
}

/* ─── Glow orb ───────────────────────────────────────────────────────── */
function Orb({ color = 'teal', pos }: { color?: string; pos: string }) {
  const c = color === 'teal' ? 'bg-teal-500' : color === 'indigo' ? 'bg-indigo-500' : 'bg-amber-500'
  return <div className={`absolute ${pos} w-96 h-96 ${c} opacity-10 rounded-full blur-[120px] pointer-events-none`} />
}

/* ─── Slide components ───────────────────────────────────────────────── */

function TitleSlide({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center px-8 overflow-hidden">
      <GridBg opacity={0.06} />
      <Particles />
      <Orb pos="-top-32 -left-32" />
      <Orb pos="-bottom-32 -right-32" color="indigo" />

      <div className={`relative transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/40">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-2xl font-black tracking-tight">AutoAuditAI</span>
        </div>

        <div className="text-xs font-bold uppercase tracking-[0.3em] text-teal-400 mb-6">LCE LUMS Cohort-4 · June 2026</div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6 tracking-tight">
          The trust layer for<br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent animate-pulse">
            every car deal.
          </span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          AI-powered vehicle inspection in 60 seconds.<br />
          For buyers, sellers, and businesses.
        </p>

        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" /> autoauditai.com</span>
          <span>·</span>
          <span>3 free inspections, no credit card</span>
        </div>
      </div>
    </div>
  )
}

function ProblemSlide({ active }: { active: boolean }) {
  const cards = [
    { who: 'Used car buyer', icon: '🔍', fear: '"Is this car hiding damage I can\'t see?"', pain: 'Pays $50+ + waits 2 days for manual inspection', color: 'border-red-500/30 bg-red-500/5' },
    { who: 'Rental owner', icon: '🚗', fear: '"How do I prove this dent wasn\'t there before?"', pain: 'Loses $500+ per disputed claim on average', color: 'border-amber-500/30 bg-amber-500/5' },
    { who: 'Car seller', icon: '💰', fear: '"How do I prove my car is clean to buyers?"', pain: 'Sells $1,000+ below market due to trust gap', color: 'border-indigo-500/30 bg-indigo-500/5' },
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-top-32 -right-32" color="indigo" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">The Problem</div>
        <h2 className="text-5xl font-black text-white mb-3 leading-tight">Every car deal starts<br />with the <span className="text-red-400">same fear.</span></h2>
        <p className="text-slate-400 text-lg mb-10">Manual inspection is too slow, too expensive, and only available in big cities.</p>

        <div className="grid grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <div key={i}
              className={`border ${c.color} rounded-2xl p-6 backdrop-blur-sm transition-all duration-500`}
              style={{ transitionDelay: active ? `${i * 100}ms` : '0ms', opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(20px)' }}>
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{c.who}</div>
              <p className="text-white font-semibold text-sm mb-4 leading-snug italic">{c.fear}</p>
              <div className="text-xs text-slate-500 leading-relaxed border-t border-white/8 pt-3">{c.pain}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SolutionSlide({ active }: { active: boolean }) {
  const rows = [
    ['Time', '1–2 days', '60 seconds'],
    ['Cost', '$50–150', 'From $2/inspection'],
    ['Availability', '3 cities only', 'Anywhere, any phone'],
    ['Report format', 'Paper, easily faked', 'Signed PDF + SHA-256 hash'],
    ['Comparison', 'Manual, error-prone', 'AI auto-compare'],
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-bottom-32 left-1/4" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-teal-400 mb-3">The Solution</div>
        <h2 className="text-5xl font-black text-white mb-2 leading-tight">AAA inspects any vehicle<br />in <span className="text-teal-400">60 seconds.</span></h2>
        <p className="text-slate-400 text-lg mb-8">Phone-based. AI-powered. 10× cheaper than the alternative.</p>

        <div className="rounded-2xl overflow-hidden border border-white/8 backdrop-blur-sm">
          <div className="grid grid-cols-3 bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-500 px-5 py-3">
            <span />
            <span>Manual Inspection</span>
            <span className="text-teal-400">AutoAuditAI ✦</span>
          </div>
          {rows.map((row, i) => (
            <div key={i}
              className="grid grid-cols-3 px-5 py-3.5 border-t border-white/5 text-sm"
              style={{ transitionDelay: active ? `${i * 80}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.4s' }}>
              <span className="text-slate-400 font-medium">{row[0]}</span>
              <span className="text-slate-500">{row[1]}</span>
              <span className="text-teal-300 font-semibold">{row[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductSlide({ active }: { active: boolean }) {
  const steps = [
    { n: '01', label: 'Record 60s walkaround', desc: 'AI extracts best frames automatically' },
    { n: '02', label: 'AI generates damage report', desc: 'Grade, severity, evidence photos' },
    { n: '03', label: 'Both parties sign & verify', desc: 'SHA-256 tamper-proof seal' },
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-top-20 right-0" color="indigo" />
      <Orb pos="-bottom-20 left-0" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3">Live Product</div>
        <h2 className="text-5xl font-black text-white mb-2">Built. Deployed.<br /><span className="text-emerald-400">Working today.</span></h2>
        <p className="text-slate-400 text-lg mb-10">
          <span className="text-white font-semibold">autoauditai.com</span> — try it now on any phone.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i}
              className="bg-white/5 border border-white/8 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/8 transition-all"
              style={{ transitionDelay: active ? `${i * 120}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.4s, background 0.2s' }}>
              <div className="text-4xl font-black text-teal-500/40 mb-3">{s.n}</div>
              <div className="text-white font-bold mb-1">{s.label}</div>
              <div className="text-slate-500 text-sm">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2 text-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-teal-300 font-semibold">Live at autoauditai.com</span>
          </div>
          <div className="text-slate-500 text-sm">Try with any vehicle, any phone, any location</div>
        </div>
      </div>
    </div>
  )
}

function PipelineSlide({ active }: { active: boolean }) {
  const steps = [
    { label: '01 Video Capture', desc: '60s guided walkaround, real-time quality feedback' },
    { label: '02 Frame Extraction', desc: 'Blur filter + pHash dedup → 30–40 unique frames' },
    { label: '03 AI Detection', desc: 'Gemini Vision: repaint, dents, cracks, rim damage' },
    { label: '04 Multi-frame Consensus', desc: 'Damage confirmed only if seen in 2+ frames' },
    { label: '05 Owner Review', desc: 'Confirm, edit, or remove AI findings' },
    { label: '06 Dual Signature', desc: 'Both parties sign → SHA-256 tamper-proof hash' },
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-top-32 left-1/3" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">How It Works</div>
        <h2 className="text-5xl font-black text-white mb-2">Hybrid AI pipeline.<br /><span className="text-cyan-400">Not a chatbot wrapper.</span></h2>
        <p className="text-slate-400 text-lg mb-8">Specialized models for detection. LLM for reasoning. Consensus for accuracy.</p>

        <div className="grid grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <div key={i}
              className="bg-white/4 border border-white/8 rounded-xl p-4 backdrop-blur-sm"
              style={{ transitionDelay: active ? `${i * 80}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.4s' }}>
              <div className="text-teal-400 text-xs font-bold mb-2">{s.label}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MarketSlide({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-bottom-32 right-0" color="amber" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-3">Market Size</div>
        <h2 className="text-5xl font-black text-white mb-2">A massive,<br /><span className="text-amber-400">underserved market.</span></h2>
        <p className="text-slate-400 text-lg mb-10">Starting in South & Southeast Asia, expanding globally.</p>

        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'TAM', sub: 'Total Addressable', value: '$8B+', desc: 'Global vehicle inspection market', color: 'border-slate-600 text-slate-300' },
            { label: 'SAM', sub: 'Serviceable', value: '$500M', desc: 'South Asia + SE Asia + GCC vehicle inspection', color: 'border-teal-500/40 text-teal-300' },
            { label: 'SOM', sub: '3-year target', value: '$15M', desc: 'Used car + rental inspection, initial markets', color: 'border-amber-500/40 text-amber-300' },
          ].map((m, i) => (
            <div key={i}
              className={`border ${m.color} bg-white/4 rounded-2xl p-6 text-center backdrop-blur-sm`}
              style={{ transitionDelay: active ? `${i * 120}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.5s' }}>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{m.sub}</div>
              <div className={`text-5xl font-black ${m.color} mb-3`}>{m.value}</div>
              <div className="text-slate-500 text-sm">{m.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm">
          700,000+ used car sales/year in Pakistan alone · 10% adoption = $5M opportunity
        </div>
      </div>
    </div>
  )
}

function BusinessSlide({ active }: { active: boolean }) {
  const margin = useCounter(97, active)
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-top-32 -left-32" color="indigo" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400 mb-3">Business Model</div>
        <h2 className="text-5xl font-black text-white mb-2"><span className="text-violet-400">{margin}%</span> gross margin.<br />Built for emerging markets.</h2>
        <p className="text-slate-400 text-lg mb-8">Cost per inspection: ~$0.10 · Avg sale: $2–5</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">B2C — Per Inspection</div>
            {[['Quick Scan', '$0.99', 'Fast AI screening'],['Standard', '$1.99', 'Full report'],['Pro', '$3.99', '+ Repaint detection']].map(([n, p, d]) => (
              <div key={n} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div><div className="text-white text-sm font-semibold">{n}</div><div className="text-slate-500 text-xs">{d}</div></div>
                <div className="text-teal-300 font-bold">{p}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">B2B — Monthly Subscription</div>
            {[['Starter', '$19/mo', '50 inspections'],['Growth', '$49/mo', '200 inspections'],['Pro', '$99/mo', '600 inspections'],['Enterprise', 'Custom', 'Unlimited']].map(([n, p, d]) => (
              <div key={n} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div><div className="text-white text-sm font-semibold">{n}</div><div className="text-slate-500 text-xs">{d}</div></div>
                <div className="text-indigo-300 font-bold">{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TractionSlide({ active }: { active: boolean }) {
  const built = [
    '✓ Full product live at autoauditai.com',
    '✓ Hybrid AI pipeline (repaint, rim, panel misalignment)',
    '✓ Video + photo capture with quality filtering',
    '✓ Dual-signature verification with SHA-256 hash',
    '✓ Before/after comparison engine',
    '✓ Admin panel + billing + Stripe integration',
    '✓ Multi-language: English, Urdu, Bahasa',
  ]
  const next = [
    '→ 10 pilot rental customers',
    '→ AI accuracy validated on 100+ real cars',
    '→ First $5,000 in revenue',
    '→ JazzCash / Easypaisa integration',
    '→ Soft launch in second market',
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-bottom-20 right-1/4" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3">Traction</div>
        <h2 className="text-5xl font-black text-white mb-8">From idea to deployed product —<br /><span className="text-emerald-400">ahead of the competition.</span></h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Built so far</div>
            <div className="space-y-2.5">
              {built.map((item, i) => (
                <div key={i}
                  className="flex items-start gap-2 text-sm text-slate-300"
                  style={{ transitionDelay: active ? `${i * 60}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.3s' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Next 90 days</div>
            <div className="space-y-2.5">
              {next.map((item, i) => (
                <div key={i}
                  className="flex items-start gap-2 text-sm text-amber-300/80"
                  style={{ transitionDelay: active ? `${(i + 7) * 60}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.3s' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompetitionSlide({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-top-32 left-0" color="indigo" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">Competition</div>
        <h2 className="text-5xl font-black text-white mb-8">Nobody serves emerging markets<br /><span className="text-teal-400">at this price point.</span></h2>

        <div className="relative bg-white/3 border border-white/8 rounded-2xl p-6 backdrop-blur-sm" style={{ height: 280 }}>
          {/* Axes */}
          <div className="absolute bottom-8 left-8 right-8 h-px bg-white/20" />
          <div className="absolute bottom-8 left-8 top-6 w-px bg-white/20" />
          {/* Labels */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500">SPEED →</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-slate-500" style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}>PRICE →</div>

          {/* Dots */}
          {[
            { label: 'PakWheels Inspect', x: 15, y: 35, color: 'bg-red-500' },
            { label: 'Tractable / Ravin', x: 65, y: 25, color: 'bg-orange-500' },
            { label: 'Workshop check', x: 20, y: 65, color: 'bg-slate-500' },
          ].map(d => (
            <div key={d.label}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: `${d.x}%`, bottom: `${d.y}%` }}>
              <div className="text-xs text-slate-400 whitespace-nowrap mb-0.5">{d.label}</div>
              <div className={`w-4 h-4 ${d.color} rounded-full`} />
            </div>
          ))}

          {/* AAA */}
          <div className="absolute flex flex-col items-center gap-1" style={{ left: '72%', bottom: '72%' }}>
            <div className="text-xs text-teal-300 font-bold whitespace-nowrap mb-0.5">AutoAuditAI ✦</div>
            <div className="w-8 h-8 bg-teal-500 rounded-full shadow-lg shadow-teal-500/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AAA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamSlide({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center items-center px-12 overflow-hidden text-center">
      <GridBg />
      <Orb pos="-top-32 left-1/3" />
      <Orb pos="-bottom-32 right-1/3" color="indigo" />

      <div className={`transition-all duration-500 max-w-2xl ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-teal-400 mb-6">Team</div>
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 shadow-2xl shadow-teal-500/30">
          SK
        </div>
        <h2 className="text-4xl font-black text-white mb-2">Solo founder.<br /><span className="text-teal-400">Shipped fast. Coachable.</span></h2>
        <p className="text-slate-400 text-lg mb-8">Built AutoAuditAI from zero to full working product using modern AI-assisted development.</p>

        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            '✓ Built and shipped solo using Claude Code',
            '✓ Deep understanding of vehicle rental market',
            '✓ Product already live and tested on real vehicles',
            '✓ Looking for mentorship and first 10 customers',
          ].map((item, i) => (
            <div key={i} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-300"
              style={{ transitionDelay: active ? `${i * 100}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.4s' }}>
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 text-slate-600 text-sm">
          Actively hiring: Sales lead · ML engineer · Customer success
        </div>
      </div>
    </div>
  )
}

function RoadmapSlide({ active }: { active: boolean }) {
  const phases = [
    { q: 'Q3 2026', title: 'Validate', color: 'border-teal-500/40 text-teal-400', items: ['10 pilot customers', 'AI accuracy benchmarks', 'First $5k revenue'] },
    { q: 'Q4 2026', title: 'Scale', color: 'border-indigo-500/40 text-indigo-400', items: ['100+ paying customers', 'Second market launch', 'Karachi + expansion'] },
    { q: '2027', title: 'Expand', color: 'border-amber-500/40 text-amber-400', items: ['1,000+ customers', 'Indonesia / Malaysia', 'Series Seed round'] },
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-12 overflow-hidden">
      <GridBg />
      <Orb pos="-bottom-20 left-0" color="indigo" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-3">Roadmap & Ask</div>
        <h2 className="text-5xl font-black text-white mb-8">Where we&apos;re going.<br /><span className="text-indigo-400">What we need from LCE.</span></h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {phases.map((p, i) => (
            <div key={i}
              className={`border ${p.color} bg-white/4 rounded-2xl p-5 backdrop-blur-sm`}
              style={{ transitionDelay: active ? `${i * 100}ms` : '0ms', opacity: active ? 1 : 0, transition: 'opacity 0.4s' }}>
              <div className={`text-xs font-bold ${p.color} mb-1`}>{p.q}</div>
              <div className="text-white font-black text-xl mb-3">{p.title}</div>
              {p.items.map((item, j) => (
                <div key={j} className="text-slate-400 text-sm py-1 border-b border-white/5 last:border-0">• {item}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-white/4 border border-teal-500/20 rounded-2xl p-5 backdrop-blur-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Our ask from LCE</div>
          <div className="flex gap-8 text-slate-300 text-sm">
            <span>🤝 Mentorship on B2B sales</span>
            <span>🏢 Intros to rental industry</span>
            <span>🚀 Support for first 50 customers</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClosingSlide({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center px-8 overflow-hidden">
      <GridBg opacity={0.06} />
      <Particles />
      <Orb pos="-top-32 -left-32" />
      <Orb pos="-bottom-32 -right-32" color="indigo" />
      <Orb pos="top-1/4 left-1/3" color="amber" />

      <div className={`relative transition-all duration-700 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-xl text-slate-400 mb-4">In 3 years,</div>
        <h1 className="text-6xl sm:text-7xl font-black mb-4 leading-tight">
          <span className="bg-gradient-to-r from-teal-400 via-white to-teal-400 bg-clip-text text-transparent">
            every car deal
          </span>
          <br />
          <span className="text-white">will involve an AAA inspection.</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12">
          Let&apos;s build the trust infrastructure for emerging markets.
        </p>

        <div className="flex items-center justify-center gap-6">
          <a href="https://autoauditai.com" target="_blank" rel="noopener noreferrer"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5 shadow-2xl shadow-teal-500/30">
            autoauditai.com →
          </a>
          <a href="https://wa.me/923434994409" target="_blank" rel="noopener noreferrer"
            className="bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all backdrop-blur-sm">
            WhatsApp us
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─── Deck data ──────────────────────────────────────────────────────── */
const SLIDES = [
  { id: 'title',       label: 'AutoAuditAI',    Component: TitleSlide },
  { id: 'problem',     label: 'Problem',         Component: ProblemSlide },
  { id: 'solution',    label: 'Solution',        Component: SolutionSlide },
  { id: 'product',     label: 'Live Product',    Component: ProductSlide },
  { id: 'pipeline',    label: 'How It Works',    Component: PipelineSlide },
  { id: 'market',      label: 'Market',          Component: MarketSlide },
  { id: 'business',    label: 'Business Model',  Component: BusinessSlide },
  { id: 'traction',    label: 'Traction',        Component: TractionSlide },
  { id: 'competition', label: 'Competition',     Component: CompetitionSlide },
  { id: 'team',        label: 'Team',            Component: TeamSlide },
  { id: 'roadmap',     label: 'Roadmap',         Component: RoadmapSlide },
  { id: 'closing',     label: 'The Vision',      Component: ClosingSlide },
]

/* ─── Main deck ──────────────────────────────────────────────────────── */
export default function PitchDeck() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const go = useCallback((n: number) => {
    setCurrent(Math.max(0, Math.min(SLIDES.length - 1, n)))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(current + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(current - 1)
      if (e.key === 'Home') go(0)
      if (e.key === 'End')  go(SLIDES.length - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current, go])

  useEffect(() => {
    if (autoplay) {
      intervalRef.current = setInterval(() => {
        setCurrent(c => c < SLIDES.length - 1 ? c + 1 : 0)
      }, 6000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoplay])

  const { Component } = SLIDES[current]

  return (
    <div className="fixed inset-0 bg-[#020810] overflow-hidden select-none">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>

      {/* Slide */}
      <div className="absolute inset-0">
        <Component active={true} key={current} />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }} />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button onClick={() => go(current - 1)} disabled={current === 0}
          className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-20">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>

        <button onClick={() => go(current + 1)} disabled={current === SLIDES.length - 1}
          className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-20">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide label + counter — top right */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-xs text-slate-600 font-medium">{SLIDES[current].label}</span>
        <span className="text-xs text-slate-700">{current + 1} / {SLIDES.length}</span>
        <button onClick={() => setAutoplay(a => !a)}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${autoplay ? 'border-teal-500/50 bg-teal-500/10 text-teal-400' : 'border-white/10 bg-white/5 text-slate-600'}`}>
          {autoplay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button onClick={() => document.documentElement.requestFullscreen?.()}
          className="w-7 h-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-600 hover:text-white transition-all">
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>

      {/* Keyboard hint — only on first slide */}
      {current === 0 && (
        <div className="absolute bottom-10 right-6 text-xs text-slate-700 flex items-center gap-1.5">
          <span>Use</span>
          <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500">→</kbd>
          <span>to navigate</span>
        </div>
      )}
    </div>
  )
}
