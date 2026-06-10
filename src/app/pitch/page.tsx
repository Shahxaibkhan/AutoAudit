'use client'
import { useState, useEffect, useCallback } from 'react'
import { ScanLine, ChevronLeft, ChevronRight } from 'lucide-react'

/* ── Each slide definition ──────────────────────────────────────── */
interface Slide {
  photo: string          // Unsplash URL
  photoPos?: string      // object-position
  overlay?: string       // CSS background for overlay
  label: string          // top pill label
  headline: string       // big hero text
  accent: string         // teal / indigo / emerald / amber etc (Tailwind color name for accent)
  sub?: string
  stats?: { value: string; label: string }[]
  bullets?: string[]
  quote?: { text: string; author: string }
  wide?: boolean         // headline takes full width (no right column)
}

const SLIDES: Slide[] = [
  {
    photo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(135deg, rgba(4,12,24,0.88) 0%, rgba(4,12,24,0.60) 60%, rgba(4,12,24,0.85) 100%)',
    label: 'LCE LUMS Cohort-4 · June 2026',
    headline: 'The trust layer for every car deal.',
    sub: 'AI-powered vehicle inspection in 60 seconds — for buyers, sellers, rental businesses, and dealers. Both parties sign. Reports are tamper-proof forever.',
    accent: 'teal',
    stats: [
      { value: '60s', label: 'Inspection time' },
      { value: 'A–F', label: 'Condition grade' },
      { value: 'SHA-256', label: 'Tamper-proof' },
      { value: '8+', label: 'Damage types' },
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2000&q=80',
    overlay: 'linear-gradient(135deg, rgba(120,0,0,0.75) 0%, rgba(4,12,24,0.80) 100%)',
    label: 'The Problem',
    headline: 'Every car transaction starts with the same fear.',
    sub: 'Manual inspection costs $50–150 and takes 2 days. Only available in major cities. Paper reports are easily faked.',
    accent: 'red',
    stats: [
      { value: '$500+', label: 'Lost per dispute' },
      { value: '2 days', label: 'Manual inspection' },
      { value: '3 cities', label: 'Only available in' },
      { value: '0 proof', label: 'With paper reports' },
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 30%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.92) 40%, rgba(4,12,24,0.50) 100%)',
    label: 'The Product',
    headline: 'AutoAuditAI inspects any vehicle in 60 seconds.',
    sub: 'Phone-based. AI-powered. 10× cheaper than any alternative. Works anywhere.',
    accent: 'teal',
    stats: [
      { value: '60s', label: 'vs 2 days manual' },
      { value: '$1–5', label: 'vs $50–150 manual' },
      { value: 'Anywhere', label: 'vs 3 cities only' },
      { value: 'Signed PDF', label: 'vs paper receipt' },
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 60%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 45%, rgba(4,12,24,0.55) 100%)',
    label: 'B2C Flow — Buyers & Sellers',
    headline: 'Know exactly what you\'re buying. Prove exactly what you\'re selling.',
    accent: 'sky',
    bullets: [
      '🛒  Buyer opens app — selects "Buying a used car"',
      '🎬  Records 60s video walkaround of the vehicle',
      '🤖  AI analyzes: repaint, dents, rim damage, headlights',
      '📊  Grade A–F report with evidence photos generated',
      '📱  Buyer shares report — seller signs to confirm',
      '🔐  SHA-256 hash seals the agreement permanently',
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=80',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 45%, rgba(4,12,24,0.55) 100%)',
    label: 'B2B Flow — Rentals & Fleet',
    headline: 'Pre-rental. Post-rental. Zero disputes.',
    sub: 'The inspection loop that ends he-said-she-said forever.',
    accent: 'indigo',
    bullets: [
      '🚗  Pre-rental: owner records car condition (60s)',
      '✍️  Owner reviews AI findings — signs with timestamp',
      '🔗  Unique link sent to renter — no signup needed',
      '👤  Renter reviews findings on their phone — signs',
      '🔐  Report locked with SHA-256 before keys hand over',
      '📸  Post-rental: AI auto-compares → only NEW damage flagged',
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(135deg, rgba(4,40,24,0.82) 0%, rgba(4,12,24,0.75) 100%)',
    label: 'The Trust Innovation',
    headline: 'Dual signature + SHA-256 hash. Industry first.',
    sub: 'Both parties review AI findings, make edits, and sign. The resulting hash is immutable — if any data changes after signing, the hash won\'t match.',
    accent: 'emerald',
    stats: [
      { value: '01', label: 'AI analyzes damage' },
      { value: '02', label: 'Owner reviews + signs' },
      { value: '03', label: 'Customer reviews + signs' },
      { value: '04', label: 'SHA-256 locks report' },
    ],
    quote: { text: 'Tamper-proof. Dispute-proof. Legally defensible.', author: 'Both parties signed — forever.' },
  },
  {
    photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 50%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.90) 40%, rgba(4,12,24,0.60) 100%)',
    label: 'AI Detection — Advanced',
    headline: 'We detect what human inspectors miss.',
    sub: 'Not just scratches and dents. Our AI finds hidden accident history.',
    accent: 'amber',
    bullets: [
      '🎨  Repaint detection — color mismatch, overspray on rubber seals',
      '📐  Panel misalignment — uneven gaps = previous accident repair',
      '🔵  Rim curb rash — metal alloy damage (not tyre marks)',
      '💡  Headlight fogging — yellowing, UV oxidation',
      '🔩  Rust & corrosion — panel, chassis, trim',
      '✅  Multi-frame consensus — confirmed in 2+ frames only',
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 60%',
    overlay: 'linear-gradient(135deg, rgba(4,12,40,0.85) 0%, rgba(4,12,24,0.70) 100%)',
    label: 'Market Opportunity',
    headline: 'A massive, underserved market.',
    sub: 'Starting in South & Southeast Asia — built to scale globally.',
    accent: 'violet',
    stats: [
      { value: '$8B+', label: 'Global TAM' },
      { value: '$500M', label: 'SE Asia + GCC SAM' },
      { value: '$15M', label: '3-year SOM' },
      { value: '700k+', label: 'Pakistan alone/year' },
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 40%, rgba(4,12,24,0.60) 100%)',
    label: 'Business Model',
    headline: '97% gross margin. Two revenue streams.',
    sub: 'Cost per inspection: ~$0.10. Average sale: $2–5.',
    accent: 'teal',
    bullets: [
      '🔍  B2C per-inspection — $0.99 quick scan → $4.99 with dual signature',
      '🏢  B2B subscription — $19/mo (50 inspections) → $99/mo (600)',
      '💼  Enterprise — Custom pricing, white-label, API access',
      '📈  Unit economics: 97% margin at scale',
      '🎯  Net revenue target: $5k by Q3 2026, $50k by Q4',
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 50%',
    overlay: 'linear-gradient(135deg, rgba(4,24,12,0.85) 0%, rgba(4,12,24,0.75) 100%)',
    label: 'Traction — What\'s Built',
    headline: 'From zero to full product — in weeks.',
    sub: 'Built solo. Deployed. Working today at autoauditai.com.',
    accent: 'emerald',
    bullets: [
      '✅  Full product live — video + photo capture, AI pipeline',
      '✅  Dual-signature with SHA-256 tamper-proof hash',
      '✅  Repaint, rim damage, panel misalignment detection',
      '✅  Before/after comparison engine (rental loop)',
      '✅  Multi-language: English, Urdu, Bahasa Indonesia, Malay',
      '✅  Admin panel + billing + demo accounts',
    ],
    stats: [
      { value: 'Live', label: 'autoauditai.com' },
      { value: '50+', label: 'Features built' },
      { value: 'Weeks', label: 'Build time' },
      { value: 'Free', label: 'Try it now' },
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 30%',
    overlay: 'linear-gradient(to right, rgba(40,4,4,0.82) 30%, rgba(4,12,24,0.75) 100%)',
    label: 'Competition',
    headline: 'Nobody offers dual-signature at this price.',
    sub: 'Competitors detect damage. We build legal-grade trust between two parties.',
    accent: 'red',
    stats: [
      { value: '2 days + $50', label: 'PakWheels Inspect' },
      { value: '$100+ · B2B only', label: 'Tractable / Ravin' },
      { value: '$10 · No AI', label: 'Workshop check' },
      { value: '60s · $1–5 · Signed', label: '✦ AutoAuditAI' },
    ],
    quote: { text: 'Our moat: the only inspection where both parties cryptographically sign off.', author: 'No competitor offers this under $5.' },
  },
  {
    photo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 40%, rgba(4,12,24,0.55) 100%)',
    label: 'Team & Roadmap',
    headline: 'Solo founder. Shipped fast. Coachable.',
    sub: 'Built AutoAuditAI from zero to full deployed product using AI-assisted development.',
    accent: 'teal',
    bullets: [
      '👤  Shahzaib Khan — Founder & CEO',
      '🚀  Full product shipped solo in weeks using Claude Code',
      '🎯  Q3 2026: 10 pilot customers + AI accuracy benchmarks',
      '📈  Q4 2026: 100+ customers + second market launch',
      '🌍  2027: 1,000+ customers + Indonesia + Malaysia',
    ],
    stats: [
      { value: '$5k', label: 'Q3 revenue target' },
      { value: '10', label: 'Pilot customers' },
      { value: '3', label: 'Markets by 2027' },
      { value: 'Series Seed', label: '2027 funding' },
    ],
  },
  {
    photo: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 50%',
    overlay: 'linear-gradient(135deg, rgba(4,12,24,0.80) 0%, rgba(4,30,24,0.78) 50%, rgba(4,12,24,0.85) 100%)',
    label: 'Our Ask from LCE',
    headline: 'In 3 years, every car deal will be verified by AI.',
    sub: 'Both parties. Signed. Sealed. Tamper-proof. We\'re building the trust infrastructure for the emerging market vehicle economy.',
    accent: 'teal',
    wide: true,
    stats: [
      { value: '🤝', label: 'B2B sales mentorship' },
      { value: '🏢', label: 'Rental industry intros' },
      { value: '🚀', label: 'First 50 customers' },
      { value: '🌍', label: 'autoauditai.com' },
    ],
  },
]

/* ── Accent color map ───────────────────────────────────────────── */
const ACCENTS: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  teal:    { text: 'text-teal-300',    border: 'border-teal-500/30',   bg: 'bg-teal-500/10',   glow: '#14b8a6' },
  red:     { text: 'text-red-300',     border: 'border-red-500/30',    bg: 'bg-red-500/10',    glow: '#ef4444' },
  indigo:  { text: 'text-indigo-300',  border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', glow: '#6366f1' },
  emerald: { text: 'text-emerald-300', border: 'border-emerald-500/30',bg: 'bg-emerald-500/10',glow: '#10b981' },
  amber:   { text: 'text-amber-300',   border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  glow: '#f59e0b' },
  violet:  { text: 'text-violet-300',  border: 'border-violet-500/30', bg: 'bg-violet-500/10', glow: '#8b5cf6' },
  sky:     { text: 'text-sky-300',     border: 'border-sky-500/30',    bg: 'bg-sky-500/10',    glow: '#0ea5e9' },
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function PitchDeck() {
  const [cur, setCur]   = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [, setDir]   = useState<'next' | 'prev'>('next')
  const [transitioning, setTransitioning] = useState(false)

  const go = useCallback((n: number) => {
    if (transitioning) return
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, n))
    if (clamped === cur) return
    setDir(clamped > cur ? 'next' : 'prev')
    setPrev(cur)
    setTransitioning(true)
    setCur(clamped)
    setTimeout(() => { setPrev(null); setTransitioning(false) }, 900)
  }, [cur, transitioning])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') go(cur + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  go(cur - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [cur, go])

  useEffect(() => {
    let sx = 0
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX }
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx
      if (Math.abs(dx) > 60) go(dx < 0 ? cur + 1 : cur - 1)
    }
    window.addEventListener('touchstart', ts)
    window.addEventListener('touchend', te)
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te) }
  }, [cur, go])

  const s = SLIDES[cur]

  return (
    <div className="fixed inset-0 bg-[#040c18] overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes kenburns { 0%{transform:scale(1.06)}100%{transform:scale(1)} }
        @keyframes fadein   { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes fadeout  { 0%{opacity:1}100%{opacity:0} }
        .ken { animation: kenburns 8s ease-out forwards }
        .slide-in  { animation: fadein  0.7s cubic-bezier(0.25,0.1,0.25,1) forwards }
        .slide-out { animation: fadeout 0.4s ease-in forwards }
      `}</style>

      {/* ── OUTGOING SLIDE (fade out) ── */}
      {prev !== null && (
        <div className="absolute inset-0 z-10 slide-out pointer-events-none">
          <SlideContent slide={SLIDES[prev]} isOut />
        </div>
      )}

      {/* ── INCOMING SLIDE ── */}
      <div className="absolute inset-0 z-20 slide-in">
        <SlideContent slide={s} />
      </div>

      {/* ── PERSISTENT UI (above slides) ── */}
      <div className="absolute top-0 inset-x-0 z-40 px-6 sm:px-10 py-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
            <ScanLine className="w-4 h-4 text-white" />
          </div>
          <span className="text-white/80 font-black text-sm tracking-tight">AutoAuditAI</span>
        </div>
        <div className="text-white/25 text-xs font-medium">{cur + 1} / {SLIDES.length}</div>
      </div>

      {/* ── NAV ARROWS ── */}
      <button onClick={() => go(cur - 1)} disabled={cur === 0}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/8 hover:bg-white/16 border border-white/12 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => go(cur + 1)} disabled={cur === SLIDES.length - 1}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/8 hover:bg-white/16 border border-white/12 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── BOTTOM BAR ── */}
      <div className="absolute bottom-0 inset-x-0 z-40 h-14 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-2 px-6">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className="transition-all duration-400 rounded-full flex-shrink-0"
            style={{
              width:  i === cur ? '28px' : '6px',
              height: '6px',
              background: i === cur ? (ACCENTS[SLIDES[i].accent]?.glow || '#14b8a6') : 'rgba(255,255,255,0.2)',
              boxShadow: i === cur ? `0 0 10px ${ACCENTS[SLIDES[i].accent]?.glow || '#14b8a6'}60` : 'none',
            }} />
        ))}
      </div>

      {/* ── PROGRESS LINE ── */}
      <div className="absolute bottom-14 inset-x-0 z-40 h-px bg-white/5">
        <div className="h-full transition-all duration-700" style={{ width: `${((cur + 1) / SLIDES.length) * 100}%`, background: ACCENTS[s.accent]?.glow || '#14b8a6' }} />
      </div>

      {/* ── KEYBOARD HINT ── */}
      {cur === 0 && (
        <div className="absolute bottom-16 right-6 z-40 text-white/20 text-xs flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">→</kbd>
          navigate
        </div>
      )}
    </div>
  )
}

/* ── Single slide renderer ──────────────────────────────────────── */
function SlideContent({ slide: s, isOut = false }: { slide: Slide; isOut?: boolean }) {
  const a = ACCENTS[s.accent] || ACCENTS.teal
  const hasTwoCol = !s.wide && (s.stats || s.bullets || s.quote)

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Photo background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.photo} alt=""
        className={`absolute inset-0 w-full h-full pointer-events-none select-none ${!isOut ? 'ken' : ''}`}
        style={{ objectFit: 'cover', objectPosition: s.photoPos || 'center' }} />

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: s.overlay || 'rgba(4,12,24,0.82)' }} />

      {/* Bottom gradient always */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#040c18] to-transparent pointer-events-none" />

      {/* Accent glow orb */}
      <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: a.glow, opacity: 0.06, filter: 'blur(80px)' }} />

      {/* Content area */}
      <div className="absolute inset-0 flex flex-col justify-end px-10 sm:px-16 pb-20 pt-24">
        {/* Label pill */}
        <div className={`inline-flex items-center self-start ${a.bg} ${a.border} border text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm mb-5 ${a.text}`}>
          {s.label}
        </div>

        {hasTwoCol ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {/* Left: headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-white leading-[1.05] tracking-tight mb-4">
                {s.headline}
              </h1>
              {s.sub && <p className="text-slate-300/80 text-base sm:text-lg leading-relaxed max-w-lg">{s.sub}</p>}
            </div>

            {/* Right: stats / bullets / quote */}
            <div>
              {s.stats && (
                <div className="grid grid-cols-2 gap-3">
                  {s.stats.map((st, i) => (
                    <div key={i} className={`${a.bg} ${a.border} border rounded-2xl p-4 backdrop-blur-md`}>
                      <div className={`text-2xl sm:text-3xl font-black ${a.text} mb-0.5`}>{st.value}</div>
                      <div className="text-slate-400 text-xs font-medium leading-tight">{st.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {s.bullets && (
                <div className={`${a.bg} ${a.border} border rounded-2xl p-5 backdrop-blur-md space-y-2.5`}>
                  {s.bullets.map((b, i) => (
                    <div key={i} className="text-slate-200 text-sm sm:text-base leading-snug">{b}</div>
                  ))}
                </div>
              )}
              {s.quote && (
                <div className={`${a.bg} ${a.border} border rounded-2xl p-5 backdrop-blur-md`}>
                  <div className={`text-3xl font-black ${a.text} leading-none mb-3`}>&ldquo;</div>
                  <p className="text-white font-semibold text-base sm:text-lg leading-snug mb-3">{s.quote.text}</p>
                  <p className={`text-sm ${a.text} font-medium`}>{s.quote.author}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Wide / no right column */
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
              {s.headline}
            </h1>
            {s.sub && <p className="text-slate-300/80 text-lg sm:text-xl leading-relaxed mb-8 max-w-3xl">{s.sub}</p>}
            {s.stats && (
              <div className="flex flex-wrap gap-3">
                {s.stats.map((st, i) => (
                  <div key={i} className={`${a.bg} ${a.border} border rounded-2xl px-5 py-3 backdrop-blur-md`}>
                    <div className={`text-2xl font-black ${a.text} leading-none mb-0.5`}>{st.value}</div>
                    <div className="text-slate-400 text-xs font-medium">{st.label}</div>
                  </div>
                ))}
              </div>
            )}
            {/* CTA on last slide */}
            {s.wide && (
              <div className="flex gap-3 mt-8">
                <a href="https://autoauditai.com" target="_blank" rel="noopener noreferrer"
                  className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-2xl shadow-teal-500/30 text-sm">
                  Try live: autoauditai.com →
                </a>
                <a href="/pitch" className="bg-white/8 border border-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/12 transition-all text-sm">
                  Restart deck
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
