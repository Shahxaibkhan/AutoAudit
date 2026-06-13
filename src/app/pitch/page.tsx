'use client'
import { useState, useEffect, useCallback } from 'react'
import { ScanLine, ChevronLeft, ChevronRight, Check, Lock, Shield } from 'lucide-react'

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
  mock?: 'capture' | 'report' | 'sign'                 // in-app HTML/CSS mockup (right column)
  funnel?: { value: string; label: string }[]          // TAM / SAM / SOM funnel (widest first)
  table?: {                                            // competition comparison matrix
    headers: string[]
    rows: string[][]
    highlightRow?: number
  }
}

const SLIDES: Slide[] = [
  /* 1 ── Title / hook ── */
  {
    photo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(135deg, rgba(4,12,24,0.88) 0%, rgba(4,12,24,0.60) 60%, rgba(4,12,24,0.85) 100%)',
    label: 'LCE LUMS Cohort-4 · June 2026',
    headline: 'The trust layer for every car deal.',
    sub: 'AI inspects any vehicle in 60 seconds — from a phone. Both parties sign. The report is sealed with a SHA-256 hash, tamper-proof forever.',
    accent: 'teal',
    stats: [
      { value: '60s', label: 'Inspection time' },
      { value: 'A–F', label: 'Condition grade' },
      { value: 'SHA-256', label: 'Tamper-proof' },
      { value: '$1–5', label: '~PKR 300–1,400' },
    ],
  },

  /* 2 ── Problem ── */
  {
    photo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2000&q=80',
    overlay: 'linear-gradient(135deg, rgba(120,0,0,0.75) 0%, rgba(4,12,24,0.80) 100%)',
    label: 'The Problem',
    headline: 'Every used-car deal starts with the same fear: "What aren\'t they telling me?"',
    sub: 'A trusted inspection costs $50–150 (PKR 14k–42k) and takes 2 days. It only exists in a few big cities. Paper reports are trivially faked — and when something goes wrong, both sides lose.',
    accent: 'red',
    stats: [
      { value: '$500+', label: 'Lost per dispute (~PKR 140k)' },
      { value: '2 days', label: 'For a manual inspection' },
      { value: '3 cities', label: 'Where it\'s even available' },
      { value: '0 proof', label: 'Behind a paper report' },
    ],
  },

  /* 3 ── Solution / product ── */
  {
    photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 30%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.92) 40%, rgba(4,12,24,0.50) 100%)',
    label: 'The Solution',
    headline: 'AutoAuditAI inspects any car in 60 seconds — from a phone.',
    sub: 'AI-powered. 10× cheaper. Works anywhere. Ends with a signed, tamper-proof report instead of a piece of paper.',
    accent: 'teal',
    stats: [
      { value: '60s', label: 'vs 2 days manual' },
      { value: '$1–5', label: 'vs $50–150 manual' },
      { value: 'Anywhere', label: 'vs 3 cities only' },
      { value: 'Signed', label: 'vs paper receipt' },
    ],
  },

  /* 4 ── How it works (capture mockup) ── */
  {
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 60%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.94) 45%, rgba(4,12,24,0.55) 100%)',
    label: 'How It Works',
    headline: 'Point. Record. Done.',
    sub: 'A guided 60-second walkaround. On-device checks reject blurry, dark, or shaky frames before the AI ever sees them.',
    accent: 'teal',
    mock: 'capture',
    bullets: [
      'Open the app and pick what you\'re doing — buying, selling, or renting',
      'Follow the on-screen guide for a 60s walkaround',
      'AI analyses the sharpest frames automatically',
    ],
  },

  /* 5 ── B2C flow ── */
  {
    photo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 30%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 45%, rgba(4,12,24,0.55) 100%)',
    label: 'B2C Flow — Buyers & Sellers',
    headline: 'Know what you\'re buying. Prove what you\'re selling.',
    accent: 'sky',
    bullets: [
      '🛒  Buyer selects "Buying a used car"',
      '🎬  Records a 60s video walkaround',
      '🤖  AI flags repaint, dents, rim damage, headlights',
      '📊  Grade A–F report with evidence photos',
      '📱  Buyer shares it — seller signs to confirm',
      '🔐  SHA-256 hash seals the agreement',
    ],
  },

  /* 6 ── B2B flow ── */
  {
    photo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=80',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 45%, rgba(4,12,24,0.55) 100%)',
    label: 'B2B Flow — Rentals & Fleet',
    headline: 'Pre-rental. Post-rental. Zero disputes.',
    sub: 'The inspection loop that ends he-said-she-said forever.',
    accent: 'indigo',
    bullets: [
      '🚗  Pre-rental: owner records the car (60s)',
      '✍️  Owner reviews AI findings — signs with a timestamp',
      '🔗  Unique link sent to the renter — no signup needed',
      '👤  Renter reviews on their phone — signs',
      '🔐  Report locked with SHA-256 before keys change hands',
      '📸  Post-rental: AI auto-compares → only NEW damage flagged',
    ],
  },

  /* 7 ── Trust moat (sign mockup) ── */
  {
    photo: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(135deg, rgba(4,40,24,0.85) 0%, rgba(4,12,24,0.80) 100%)',
    label: 'The Trust Innovation',
    headline: 'Both parties sign. Then SHA-256 seals it.',
    sub: 'Owner and customer each review the AI findings, make edits, and sign on their own phone. Change one character afterwards and the hash no longer matches.',
    accent: 'emerald',
    mock: 'sign',
    bullets: [
      'AI analyses the damage',
      'Owner reviews + signs',
      'Customer reviews + signs',
      'SHA-256 locks the report — forever',
    ],
  },

  /* 8 ── AI detection (report mockup) ── */
  {
    photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 50%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.92) 42%, rgba(4,12,24,0.60) 100%)',
    label: 'AI Detection',
    headline: 'A second pair of eyes that never gets tired.',
    sub: 'AI assists the inspection — flagging dents, scratches, and subtle signs of past repairs so people can decide with more confidence. It supports human judgement; it doesn\'t replace it.',
    accent: 'amber',
    mock: 'report',
    bullets: [
      '🎨  Flags possible repaint — colour mismatch & overspray',
      '📐  Highlights panel-gap differences worth a closer look',
      '🔵  Spots likely rim curb rash on alloys',
      '💡  Notes headlight fogging & UV oxidation',
      '✅  Multi-frame consensus — flagged only when seen in 2+ frames',
    ],
  },

  /* 9 ── Why now ── */
  {
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 60%',
    overlay: 'linear-gradient(135deg, rgba(4,12,40,0.86) 0%, rgba(4,12,24,0.72) 100%)',
    label: 'Why Now',
    headline: 'Three curves just crossed.',
    sub: 'What was impossible and expensive two years ago is now cents on a phone.',
    accent: 'violet',
    bullets: [
      '🧠  AI vision cost collapsed ~100× — an inspection now costs cents',
      '📱  Smartphone cameras are everywhere in emerging markets',
      '🚗  Used-car volumes are booming post-inflation',
      '🌐  Online car marketplaces desperately need a trust rail',
    ],
  },

  /* 10 ── Market (funnel) ── */
  {
    photo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.92) 42%, rgba(4,12,24,0.58) 100%)',
    label: 'Market Opportunity',
    headline: 'A massive, underserved market.',
    sub: 'Starting in Pakistan — 700k+ used-car transactions every year — and built to scale across South & Southeast Asia and the GCC.',
    accent: 'violet',
    funnel: [
      { value: '$8B+', label: 'Global TAM' },
      { value: '$500M', label: 'SE Asia + GCC SAM' },
      { value: '$15M', label: '3-year SOM' },
    ],
  },

  /* 11 ── Business model + pricing ── */
  {
    photo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 40%, rgba(4,12,24,0.60) 100%)',
    label: 'Business Model',
    headline: 'Software margins. Two revenue engines.',
    sub: 'Real cost per inspection today (Gemini MVP): ~$0.05 video, ~$0.02 photo (PKR 4–13). Even on the full Claude + Roboflow stack it stays under $0.20.',
    accent: 'teal',
    bullets: [
      '🔍  B2C per-inspection — $0.99 quick scan (PKR 299) → $4.99 signed (PKR 1,399)',
      '🏢  B2B subscription — $19/mo · 50 (PKR 5.3k) → $99/mo · 600 (PKR 27.5k)',
      '💼  Enterprise — custom pricing, white-label, API access',
      '📈  Gross margin: ~96–99% at scale (verified from live pipeline)',
      '🎯  Net revenue: $5k by Q3 2026 → $50k by Q4',
    ],
  },

  /* 12 ── Traction ── */
  {
    photo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 50%',
    overlay: 'linear-gradient(135deg, rgba(4,24,12,0.85) 0%, rgba(4,12,24,0.75) 100%)',
    label: 'Traction — What\'s Built',
    headline: 'From zero to a full product — in weeks.',
    sub: 'Built solo. Deployed. Working today at autoauditai.com.',
    accent: 'emerald',
    bullets: [
      '✅  Live product — video + photo capture, AI pipeline',
      '✅  Dual-signature with SHA-256 tamper-proof hash',
      '✅  Repaint, rim & panel-misalignment detection',
      '✅  Before/after comparison engine (rental loop)',
      '✅  Multi-language: English, Urdu, Bahasa, Malay',
      '✅  Admin panel + billing + demo accounts',
    ],
    stats: [
      { value: 'Live', label: 'autoauditai.com' },
      { value: '50+', label: 'Features built' },
      { value: 'Weeks', label: 'Build time' },
      { value: 'Free', label: 'Try it now' },
    ],
  },

  /* 13 ── Competition (table) ── */
  {
    photo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 30%',
    overlay: 'linear-gradient(to right, rgba(40,4,4,0.82) 25%, rgba(4,12,24,0.82) 100%)',
    label: 'Competition',
    headline: 'Nobody offers dual-signature at this price.',
    sub: 'Competitors detect damage. We build legal-grade trust between two parties.',
    accent: 'red',
    wide: true,
    table: {
      headers: ['', 'Speed', 'Price', 'AI', 'Dual sign'],
      rows: [
        ['PakWheels Inspect', '2 days', '$50 · PKR 14k', 'No', 'No'],
        ['Tractable / Ravin', 'Minutes', '$100+ · B2B only', 'Yes', 'No'],
        ['Workshop check', '1 day', '$10 · PKR 2.8k', 'No', 'No'],
        ['AutoAuditAI', '60 sec', '$1–5 · PKR 300–1,400', 'Yes', 'Yes'],
      ],
      highlightRow: 3,
    },
  },

  /* 14 ── Team & roadmap ── */
  {
    photo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 40%',
    overlay: 'linear-gradient(to right, rgba(4,12,24,0.93) 40%, rgba(4,12,24,0.55) 100%)',
    label: 'Team & Roadmap',
    headline: 'Solo founder. Shipped fast. Coachable.',
    sub: 'Built AutoAuditAI from zero to a deployed product using AI-assisted development.',
    accent: 'teal',
    bullets: [
      '👤  Shahzaib Khan — Founder & CEO',
      '🚀  Full product shipped solo in weeks',
      '🎯  Q3 2026: 10 pilot customers + accuracy benchmarks',
      '📈  Q4 2026: 100+ customers + 2nd market launch',
      '🌍  2027: 1,000+ customers — Indonesia + Malaysia',
    ],
    stats: [
      { value: '$5k', label: 'Q3 revenue target' },
      { value: '10', label: 'Pilot customers' },
      { value: '3', label: 'Markets by 2027' },
      { value: 'Seed', label: '2027 funding' },
    ],
  },

  /* 15 ── Ask / vision ── */
  {
    photo: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2000&q=80',
    photoPos: 'center 50%',
    overlay: 'linear-gradient(135deg, rgba(4,12,24,0.80) 0%, rgba(4,30,24,0.78) 50%, rgba(4,12,24,0.85) 100%)',
    label: 'Our Ask from LCE',
    headline: 'In 3 years, every car deal will be verified by AI.',
    sub: 'Both parties. Signed. Sealed. Tamper-proof. We\'re building the trust infrastructure for the emerging-market vehicle economy.',
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
  const hasRight = !!(s.mock || s.funnel || s.stats || s.bullets || s.quote)
  const twoCol = !s.wide && hasRight
  const leftSteps = s.mock && s.bullets ? s.bullets : null

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
      <div className="absolute inset-0 flex flex-col justify-center px-10 sm:px-16 pb-24 pt-24">
        {/* Label pill */}
        <div className={`inline-flex items-center self-start ${a.bg} ${a.border} border text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm mb-5 ${a.text}`}>
          {s.label}
        </div>

        {twoCol ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {/* Left: headline + sub (+ steps for mock slides) */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-white leading-[1.05] tracking-tight mb-4">
                {s.headline}
              </h1>
              {s.sub && <p className="text-slate-300/80 text-base sm:text-lg leading-relaxed max-w-lg">{s.sub}</p>}
              {leftSteps && (
                <div className="mt-5 space-y-2.5">
                  {leftSteps.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`shrink-0 w-7 h-7 rounded-full ${a.bg} ${a.border} border flex items-center justify-center text-xs font-black ${a.text}`}>{i + 1}</div>
                      <span className="text-slate-200 text-sm sm:text-base leading-snug">{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: mockup / funnel / stats / bullets / quote */}
            <div>
              {s.mock === 'capture' && <MockCapture a={a} />}
              {s.mock === 'report'  && <MockReport a={a} />}
              {s.mock === 'sign'    && <MockSign a={a} />}
              {!s.mock && s.funnel && <Funnel a={a} items={s.funnel} />}
              {!s.mock && !s.funnel && s.stats && (
                <div className="grid grid-cols-2 gap-3">
                  {s.stats.map((st, i) => (
                    <div key={i} className={`${a.bg} ${a.border} border rounded-2xl p-4 backdrop-blur-md`}>
                      <div className={`text-2xl sm:text-3xl font-black ${a.text} mb-0.5`}>{st.value}</div>
                      <div className="text-slate-400 text-xs font-medium leading-tight">{st.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {!s.mock && !s.funnel && !s.stats && s.bullets && (
                <div className={`${a.bg} ${a.border} border rounded-2xl p-5 backdrop-blur-md space-y-2.5`}>
                  {s.bullets.map((b, i) => (
                    <div key={i} className="text-slate-200 text-sm sm:text-base leading-snug">{b}</div>
                  ))}
                </div>
              )}
              {!s.mock && !s.funnel && !s.stats && !s.bullets && s.quote && (
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
          <div className="max-w-5xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
              {s.headline}
            </h1>
            {s.sub && <p className="text-slate-300/80 text-lg sm:text-xl leading-relaxed mb-8 max-w-3xl">{s.sub}</p>}

            {s.table && <CompareTable a={a} table={s.table} />}

            {!s.table && s.stats && (
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
            {s.wide && !s.table && (
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

/* ── Reusable accent type ───────────────────────────────────────── */
type Accent = { text: string; border: string; bg: string; glow: string }

/* ── HTML/CSS mockup: phone capture screen ──────────────────────── */
function MockCapture({ a }: { a: Accent }) {
  return (
    <div className="relative mx-auto w-[230px] h-[460px] rounded-[2.4rem] border-[6px] border-white/15 bg-black overflow-hidden shadow-2xl"
      style={{ boxShadow: `0 30px 80px -20px ${a.glow}55` }}>
      {/* Camera scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900" />
      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-44 h-20 rounded-[45%] bg-black/40 blur-md" />
      {/* Car silhouette */}
      <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2">
        <div className="w-40 h-14 rounded-t-[2rem] rounded-b-lg bg-slate-500/80" />
        <div className="w-44 h-8 -mt-1 -ml-2 rounded-xl bg-slate-600/80" />
        <div className="flex justify-between px-3 -mt-3">
          <div className="w-7 h-7 rounded-full bg-slate-900/80 border-2 border-slate-700" />
          <div className="w-7 h-7 rounded-full bg-slate-900/80 border-2 border-slate-700" />
        </div>
      </div>
      {/* REC pill */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> REC 12s
      </div>
      {/* Back chip */}
      <div className="absolute top-3 left-3 text-white/80 text-[9px] font-semibold bg-black/40 px-2 py-1 rounded-full">‹ Back</div>
      {/* Step hint */}
      <div className="absolute bottom-24 inset-x-0 text-center">
        <span className="text-white text-[10px] font-semibold bg-black/30 px-2.5 py-1 rounded-full">Walk to the right side →</span>
      </div>
      {/* Walkaround dots */}
      <div className="absolute bottom-[68px] inset-x-0 flex items-center justify-center gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={`rounded-full ${i === 1 ? 'w-2.5 h-2.5 bg-white' : i === 0 ? 'w-2 h-2 bg-teal-400' : 'w-2 h-2 bg-white/30'}`} />
            {i < 3 && <span className={`h-px w-5 ${i === 0 ? 'bg-teal-400' : 'bg-white/20'}`} />}
          </span>
        ))}
      </div>
      {/* Shutter */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-white/85 flex items-center justify-center">
        <div className="w-9 h-9 bg-red-500 rounded-full" />
      </div>
    </div>
  )
}

/* ── HTML/CSS mockup: graded report card ────────────────────────── */
function MockReport({ a }: { a: Accent }) {
  const rows = [
    { sev: 'bg-red-500',    label: 'Repaint — front-left fender',  tag: 'Severe' },
    { sev: 'bg-amber-500',  label: 'Panel gap — rear-right door',  tag: 'Moderate' },
    { sev: 'bg-amber-500',  label: 'Rim curb rash — front-left',   tag: 'Moderate' },
    { sev: 'bg-slate-400',  label: 'Headlight fogging — both',     tag: 'Minor' },
  ]
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl bg-white/95 p-4 shadow-2xl"
      style={{ boxShadow: `0 30px 80px -24px ${a.glow}55` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-amber-400 text-white font-black text-xl flex items-center justify-center shadow-inner">B</div>
        <div className="min-w-0">
          <div className="text-slate-900 font-bold text-sm">Toyota Corolla · 2019</div>
          <div className="text-slate-500 text-xs">Condition grade · 4 findings</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-2.5 py-2">
            <span className={`w-2 h-2 rounded-full ${r.sev} shrink-0`} />
            <span className="text-slate-700 text-xs font-medium flex-1 truncate">{r.label}</span>
            <span className="text-slate-400 text-[10px] font-semibold">{r.tag}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
        <Lock className="w-3 h-3" /> SHA-256 · 9f3a7b…c7e1 · sealed
      </div>
    </div>
  )
}

/* ── HTML/CSS mockup: dual-signature card ───────────────────────── */
function MockSign({ a }: { a: Accent }) {
  const signers = [
    { role: 'Owner',    phone: '+92 ***  1234', time: '13 Jun · 14:02' },
    { role: 'Customer', phone: '+92 ***  8842', time: '13 Jun · 14:09' },
  ]
  return (
    <div className="mx-auto w-full max-w-sm space-y-3">
      {signers.map((sg, i) => (
        <div key={i} className="rounded-2xl bg-white/95 px-4 py-3 shadow-2xl flex items-center gap-3"
          style={{ boxShadow: `0 24px 60px -28px ${a.glow}55` }}>
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900 font-bold text-sm">{sg.role} signed</div>
            <div className="text-slate-500 text-xs font-mono">{sg.phone}</div>
          </div>
          <div className="text-slate-400 text-[10px] font-medium text-right">{sg.time}</div>
        </div>
      ))}
      <div className={`rounded-2xl ${a.bg} ${a.border} border px-4 py-3 backdrop-blur-md flex items-center gap-3`}>
        <Shield className={`w-5 h-5 ${a.text} shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">Report locked</div>
          <div className="text-slate-300/80 text-[10px] font-mono truncate">SHA-256 · 9f3a7b21…c7e1d480</div>
        </div>
      </div>
    </div>
  )
}

/* ── TAM / SAM / SOM funnel ──────────────────────────────────────── */
function Funnel({ a, items }: { a: Accent; items: { value: string; label: string }[] }) {
  const widths = ['100%', '74%', '50%']
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="mx-auto" style={{ width: widths[i] || '40%' }}>
          <div className={`${a.bg} ${a.border} border rounded-xl px-4 py-3 backdrop-blur-md flex items-center justify-center gap-2`}>
            <span className={`text-2xl font-black ${a.text}`}>{it.value}</span>
            <span className="text-slate-300 text-xs font-medium">{it.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Competition comparison table ───────────────────────────────── */
function CompareTable({ a, table }: { a: Accent; table: NonNullable<Slide['table']> }) {
  return (
    <div className={`${a.border} border rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 max-w-3xl`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} className="px-3 sm:px-4 py-3 text-slate-400 text-xs font-semibold uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, ri) => {
            const hi = ri === table.highlightRow
            return (
              <tr key={ri} className={hi ? a.bg : ''}>
                {r.map((c, ci) => (
                  <td key={ci}
                    className={`px-3 sm:px-4 py-3 text-sm border-t border-white/10 ${ci === 0 ? 'font-bold' : ''} ${hi ? `${a.text} font-semibold` : 'text-slate-200'}`}>
                    {c === 'Yes' ? <span className="text-emerald-400 font-bold">✓ Yes</span> : c === 'No' ? <span className="text-slate-500">— No</span> : c}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
