'use client'
import { useState, useEffect, useCallback } from 'react'
import { ScanLine, ChevronRight, ChevronLeft } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   CAR SVG — side view sedan, every panel selectable
═══════════════════════════════════════════════════════════════════ */
type PanelName = 'frontBumper'|'hood'|'windshield'|'roof'|'rearWindow'|'trunk'|'rearBumper'|'driverDoor'|'passDoor'|'frontWheel'|'rearWheel'

interface PanelState { color?: string; glow?: boolean; damaged?: boolean; repaint?: boolean }

function Car({ panels = {}, className = '' }: { panels?: Partial<Record<PanelName, PanelState>>; className?: string }) {
  const p = (name: PanelName) => {
    const s = panels[name] || {}
    const base = '#1e293b'
    const fill = s.repaint ? '#7c3aed' : s.damaged ? '#dc2626' : s.color || base
    const opacity = s.glow ? 0.9 : 0.7
    const filter = s.glow ? `drop-shadow(0 0 8px ${fill})` : s.damaged ? `drop-shadow(0 0 6px #ef4444)` : 'none'
    return { fill, opacity, filter }
  }

  return (
    <svg viewBox="0 0 1000 380" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Shadow under car */}
      <ellipse cx="500" cy="365" rx="420" ry="18" fill="#000" opacity="0.4" />

      {/* Rear bumper */}
      <path d="M 820,290 L 875,285 L 885,310 L 880,340 L 820,340 Z"
        style={p('rearBumper')} stroke="#475569" strokeWidth="1.5" />

      {/* Trunk */}
      <path d="M 730,195 L 820,225 L 820,290 L 730,290 Z"
        style={p('trunk')} stroke="#475569" strokeWidth="1.5" />

      {/* Rear window */}
      <path d="M 660,155 L 730,145 L 730,195 L 660,205 Z"
        style={{ ...p('rearWindow'), fill: '#bfdbfe', opacity: 0.35 }} stroke="#60a5fa" strokeWidth="1" />

      {/* Roof */}
      <path d="M 330,130 L 660,125 L 660,155 L 640,165 L 330,165 Z"
        style={p('roof')} stroke="#475569" strokeWidth="1.5" />

      {/* Windshield */}
      <path d="M 245,155 L 330,130 L 330,165 L 255,185 Z"
        style={{ ...p('windshield'), fill: '#bfdbfe', opacity: 0.3 }} stroke="#60a5fa" strokeWidth="1" />

      {/* Hood */}
      <path d="M 145,230 L 245,190 L 245,155 L 245,185 L 145,230 Z"
        style={p('hood')} stroke="#475569" strokeWidth="1.5" />
      <path d="M 145,230 L 245,190 L 245,185 L 145,230 Z"
        style={p('hood')} stroke="#475569" strokeWidth="1.5" />

      {/* Front bumper */}
      <path d="M 80,265 L 145,235 L 145,300 L 80,305 L 75,285 Z"
        style={p('frontBumper')} stroke="#475569" strokeWidth="1.5" />

      {/* Main car body */}
      <path d="M 80,265 L 145,235 L 245,190 L 330,165 L 640,165 L 660,155 L 730,145 L 730,225 L 820,240 L 820,340 L 80,340 Z"
        fill="url(#bodyGrad)" stroke="#334155" strokeWidth="2" opacity="0.5" />

      {/* Passenger door */}
      <path d="M 490,168 L 650,168 L 650,300 L 490,300 Z"
        style={p('passDoor')} stroke="#475569" strokeWidth="1.5" opacity="0.6" />

      {/* Driver door */}
      <path d="M 280,170 L 490,168 L 490,300 L 280,300 Z"
        style={p('driverDoor')} stroke="#475569" strokeWidth="1.5" opacity="0.6" />

      {/* Door line between doors */}
      <line x1="490" y1="168" x2="490" y2="300" stroke="#475569" strokeWidth="2" opacity="0.8" />

      {/* Rocker panel line */}
      <line x1="150" y1="300" x2="820" y2="300" stroke="#475569" strokeWidth="1.5" opacity="0.4" />

      {/* Rear wheel arch */}
      <path d="M 700,340 Q 700,290 750,280 Q 800,270 830,310 Q 840,340 820,340 Z"
        fill="#0f172a" stroke="#334155" strokeWidth="1" />
      {/* Front wheel arch */}
      <path d="M 150,340 Q 140,295 170,280 Q 200,265 240,275 Q 275,285 280,340 Z"
        fill="#0f172a" stroke="#334155" strokeWidth="1" />

      {/* Front wheel */}
      <circle cx="215" cy="340" r="50" fill="#0f172a" stroke="#334155" strokeWidth="2" style={p('frontWheel')} />
      <circle cx="215" cy="340" r="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <circle cx="215" cy="340" r="18" fill="#334155" />
      {[0,60,120,180,240,300].map(a => (
        <line key={a} x1={215+18*Math.cos(a*Math.PI/180)} y1={340+18*Math.sin(a*Math.PI/180)}
          x2={215+33*Math.cos(a*Math.PI/180)} y2={340+33*Math.sin(a*Math.PI/180)}
          stroke="#64748b" strokeWidth="2.5" />
      ))}

      {/* Rear wheel */}
      <circle cx="760" cy="340" r="50" fill="#0f172a" stroke="#334155" strokeWidth="2" style={p('rearWheel')} />
      <circle cx="760" cy="340" r="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <circle cx="760" cy="340" r="18" fill="#334155" />
      {[0,60,120,180,240,300].map(a => (
        <line key={a} x1={760+18*Math.cos(a*Math.PI/180)} y1={340+18*Math.sin(a*Math.PI/180)}
          x2={760+33*Math.cos(a*Math.PI/180)} y2={340+33*Math.sin(a*Math.PI/180)}
          stroke="#64748b" strokeWidth="2.5" />
      ))}

      {/* Headlight */}
      <ellipse cx="92" cy="258" rx="18" ry="12" fill="#fbbf24" opacity="0.7" />
      <ellipse cx="92" cy="258" rx="10" ry="7" fill="#fef3c7" opacity="0.9" />

      {/* Taillight */}
      <rect x="862" y="285" width="18" height="28" rx="3" fill="#ef4444" opacity="0.8" />

      {/* Door handle markers */}
      <rect x="380" y="230" width="22" height="6" rx="3" fill="#64748b" opacity="0.6" />
      <rect x="560" y="230" width="22" height="6" rx="3" fill="#64748b" opacity="0.6" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   DAMAGE MARKER
═══════════════════════════════════════════════════════════════════ */
function DamagePin({ x, y, label, severity = 'moderate', visible, delay = 0 }:
  { x: number; y: number; label: string; severity?: string; visible: boolean; delay?: number }) {
  const color = severity === 'severe' ? '#ef4444' : severity === 'moderate' ? '#f59e0b' : '#10b981'
  return (
    <div className="absolute transition-all duration-500"
      style={{ left: `${x}%`, top: `${y}%`, opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0)', transitionDelay: `${delay}ms`, zIndex: 20 }}>
      {/* Pulsing ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: color, width: 20, height: 20, margin: '-5px' }} />
        <div className="w-3 h-3 rounded-full border-2 border-white relative" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      {/* Label */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap">
        <div className="text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm border"
          style={{ background: `${color}22`, borderColor: `${color}55`, boxShadow: `0 0 10px ${color}22` }}>
          {label}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PERSON WITH PHONE — stick figure + phone
═══════════════════════════════════════════════════════════════════ */
function Person({ x, recording = false, signing = false, label = '' }:
  { x: number; recording?: boolean; signing?: boolean; label?: string }) {
  return (
    <div className="absolute bottom-[38%] transition-all duration-1000" style={{ left: `${x}%` }}>
      <div className="flex flex-col items-center">
        {/* Phone */}
        <div className={`relative mb-1 transition-all duration-500 ${recording ? 'scale-110' : ''}`}>
          <div className={`w-7 h-11 rounded-lg border-2 flex items-center justify-center transition-all ${recording ? 'border-red-400 shadow-lg shadow-red-500/50' : signing ? 'border-emerald-400 shadow-lg shadow-emerald-500/50' : 'border-slate-400'}`}
            style={{ background: recording ? '#1a0a0a' : signing ? '#0a1a0a' : '#1e293b' }}>
            {recording && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
            {signing && <div className="text-emerald-400 text-xs font-bold">✓</div>}
            {!recording && !signing && <div className="w-2 h-1.5 rounded-sm bg-teal-400/60" />}
          </div>
          {recording && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white animate-pulse" />}
        </div>
        {/* Body */}
        <svg width="36" height="65" viewBox="0 0 36 65">
          {/* Head */}
          <circle cx="18" cy="8" r="7" fill="#94a3b8" />
          {/* Body */}
          <line x1="18" y1="15" x2="18" y2="42" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arms */}
          <line x1="18" y1="22" x2="8" y2="32" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="22" x2="28" y2="22" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <line x1="18" y1="42" x2="10" y2="60" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="42" x2="26" y2="60" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {label && <div className="text-xs text-slate-400 font-medium mt-1 whitespace-nowrap">{label}</div>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING TEXT CARD
═══════════════════════════════════════════════════════════════════ */
function FloatCard({ x, y, title, sub, color = '#14b8a6', visible, delay = 0 }:
  { x: number; y: number; title: string; sub?: string; color?: string; visible: boolean; delay?: number }) {
  return (
    <div className="absolute transition-all duration-600 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.9)',
        transitionDelay: `${delay}ms`, zIndex: 25 }}>
      <div className="px-3 py-2 rounded-xl border backdrop-blur-md whitespace-nowrap"
        style={{ background: `${color}12`, borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` }}>
        <div className="font-black text-sm text-white">{title}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: `${color}cc` }}>{sub}</div>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   GRADE CIRCLE
═══════════════════════════════════════════════════════════════════ */
function GradeCircle({ visible, grade = 'B' }: { visible: boolean; grade?: string }) {
  const colors: Record<string, string> = { A: '#10b981', B: '#14b8a6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }
  const c = colors[grade] || '#14b8a6'
  return (
    <div className="absolute transition-all duration-700"
      style={{ right: '8%', top: '15%', opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)', zIndex: 30 }}>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center"
          style={{ borderColor: c, boxShadow: `0 0 30px ${c}40, inset 0 0 20px ${c}15`, background: `${c}10` }}>
          <span className="text-5xl font-black text-white">{grade}</span>
        </div>
        <div className="text-xs text-slate-400 mt-2 font-semibold">Condition Grade</div>
        <div className="text-xs font-bold mt-0.5" style={{ color: c }}>Good condition</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SHA-256 SEAL
═══════════════════════════════════════════════════════════════════ */
function HashSeal({ visible }: { visible: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-800"
      style={{ opacity: visible ? 1 : 0, zIndex: 40 }}>
      <div className="border-2 border-emerald-500 rounded-2xl p-6 backdrop-blur-md text-center"
        style={{ background: '#0a2a1a', boxShadow: '0 0 60px #10b98140' }}>
        <div className="text-4xl mb-3">🔐</div>
        <div className="text-emerald-400 font-black text-lg mb-1">REPORT LOCKED</div>
        <div className="text-emerald-300/70 font-bold text-xs mb-3">Both parties signed · SHA-256 verified</div>
        <div className="font-mono text-xs text-emerald-500/60 max-w-xs leading-relaxed">
          7d4f9e2a3c8b1f6d...<br />4e8b2c9a1f3d5e7b
        </div>
        <div className="mt-3 text-xs text-slate-500">Tamper-proof forever</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   WALK ARROWS
═══════════════════════════════════════════════════════════════════ */
function WalkArrow({ x, y, dir, visible, delay = 0 }: { x: number; y: number; dir: string; visible: boolean; delay?: number }) {
  return (
    <div className="absolute transition-all duration-500 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, opacity: visible ? 0.8 : 0, transitionDelay: `${delay}ms` }}>
      <div className="text-teal-400 text-2xl font-black animate-bounce">{dir}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   STORY SCENES
═══════════════════════════════════════════════════════════════════ */
interface Scene {
  id: string
  heading: string
  sub: string
  panels: Partial<Record<PanelName, PanelState>>
  person1?: { x: number; recording?: boolean; signing?: boolean; label?: string }
  person2?: { x: number; signing?: boolean; label?: string }
  damages?: Array<{ x: number; y: number; label: string; severity?: string; delay?: number }>
  floats?: Array<{ x: number; y: number; title: string; sub?: string; color?: string; delay?: number }>
  arrows?: Array<{ x: number; y: number; dir: string; delay?: number }>
  grade?: boolean
  seal?: boolean
  bgAccent?: string
}

const SCENES: Scene[] = [
  {
    id: 'intro',
    heading: 'The trust layer for every car deal.',
    sub: 'AI-powered inspection. Both parties sign. Tamper-proof forever.',
    panels: {},
    person1: { x: 2, label: 'Owner / Inspector' },
    bgAccent: '#14b8a6',
  },
  {
    id: 'problem',
    heading: '"How do I prove this dent wasn\'t there before?"',
    sub: 'Disputes cost rental owners $300–500+ per incident. Manual inspection takes 2 days.',
    panels: {
      driverDoor: { color: '#991b1b', glow: true },
      rearBumper: { color: '#991b1b' },
    },
    damages: [
      { x: 28, y: 52, label: 'Dispute: who did this?', severity: 'severe', delay: 200 },
      { x: 78, y: 55, label: 'No proof at return', severity: 'moderate', delay: 400 },
    ],
    person1: { x: 2, label: 'Frustrated owner' },
    floats: [{ x: 35, y: 10, title: '$500+ lost', sub: 'Per unresolved dispute', color: '#ef4444' }],
    bgAccent: '#ef4444',
  },
  {
    id: 'record-start',
    heading: 'Stand at the front. Tap Record.',
    sub: 'Walk slowly clockwise around the entire car. All 4 sides. 60 seconds.',
    panels: { frontBumper: { glow: true, color: '#0f766e' }, hood: { glow: true, color: '#0f766e' } },
    person1: { x: 2, recording: true, label: 'Recording...' },
    arrows: [{ x: 18, y: 28, dir: '→', delay: 300 }],
    floats: [{ x: 6, y: 12, title: '● REC  3s', sub: 'Walk to right side', color: '#ef4444', delay: 200 }],
    bgAccent: '#14b8a6',
  },
  {
    id: 'record-right',
    heading: 'Walk to the right side →',
    sub: 'AI extracts the sharpest frames automatically. Blur detection. pHash deduplication.',
    panels: { passDoor: { glow: true, color: '#0f766e' }, rearWindow: { glow: true } },
    person1: { x: 60, recording: true, label: 'Recording...' },
    arrows: [
      { x: 72, y: 28, dir: '→', delay: 0 },
      { x: 72, y: 42, dir: '↓', delay: 150 },
    ],
    floats: [
      { x: 52, y: 8, title: '● REC  18s', sub: 'Right side captured', color: '#ef4444' },
      { x: 62, y: 72, title: '12 frames', sub: 'Quality filtered', color: '#14b8a6', delay: 400 },
    ],
    bgAccent: '#14b8a6',
  },
  {
    id: 'record-rear',
    heading: 'Continue to the rear of the car.',
    sub: 'The direction guide keeps you on track. Minimum 45 seconds covers all 4 sides.',
    panels: {
      trunk: { glow: true, color: '#0f766e' },
      rearBumper: { glow: true, color: '#0f766e' },
      rearWindow: { glow: true },
    },
    person1: { x: 92, recording: true, label: 'Recording...' },
    arrows: [{ x: 85, y: 28, dir: '↓', delay: 0 }],
    floats: [
      { x: 68, y: 8, title: '● REC  32s', sub: 'Rear captured ✓', color: '#ef4444' },
      { x: 68, y: 72, title: '28 frames', sub: 'All unique', color: '#14b8a6', delay: 300 },
    ],
    bgAccent: '#6366f1',
  },
  {
    id: 'ai-detecting',
    heading: 'AI scans every frame simultaneously.',
    sub: 'Scratches, dents, repaint, rim damage, panel misalignment, headlight fogging.',
    panels: {
      driverDoor: { damaged: true },
      hood: { repaint: true },
      frontBumper: { damaged: true },
      frontWheel: { damaged: true, color: '#b45309' },
    },
    person1: { x: 2, label: 'Waiting...' },
    damages: [
      { x: 9, y: 48, label: 'Scratch — driver door', severity: 'moderate', delay: 0 },
      { x: 17, y: 32, label: 'Repaint detected', severity: 'severe', delay: 300 },
      { x: 9, y: 68, label: 'Rim curb rash', severity: 'moderate', delay: 600 },
      { x: 5, y: 48, label: 'Paint chip', severity: 'minor', delay: 900 },
    ],
    floats: [
      { x: 40, y: 8, title: '🤖 AI analyzing...', sub: 'Gemini Vision', color: '#6366f1', delay: 0 },
      { x: 40, y: 75, title: 'Multi-frame consensus', sub: 'Each damage seen in 2+ frames', color: '#14b8a6', delay: 800 },
    ],
    bgAccent: '#6366f1',
  },
  {
    id: 'report',
    heading: 'Report generated. Grade assigned.',
    sub: 'Evidence photos per damage. Severity ratings. Owner reviews before sharing.',
    panels: {
      driverDoor: { damaged: true },
      hood: { repaint: true },
      frontBumper: { damaged: true },
      frontWheel: { damaged: true, color: '#b45309' },
    },
    person1: { x: 2, label: 'Reviewing...' },
    damages: [
      { x: 9, y: 48, label: 'Moderate scratch', severity: 'moderate', delay: 0 },
      { x: 17, y: 32, label: 'Repaint — accident?', severity: 'severe', delay: 100 },
      { x: 9, y: 68, label: 'Rim damage', severity: 'moderate', delay: 200 },
    ],
    grade: true,
    floats: [
      { x: 35, y: 8, title: '4 damages found', sub: 'Owner review required', color: '#f59e0b', delay: 200 },
    ],
    bgAccent: '#f59e0b',
  },
  {
    id: 'owner-sign',
    heading: 'Owner confirms, edits, then signs.',
    sub: 'Remove false positives. Add missed items. Digital signature with timestamp.',
    panels: {
      driverDoor: { color: '#065f46', glow: true },
      frontBumper: { color: '#065f46', glow: true },
      frontWheel: { color: '#065f46', glow: true },
    },
    person1: { x: 2, signing: true, label: 'Owner signing...' },
    floats: [
      { x: 5, y: 8, title: '✓ Confirmed: 3 damages', sub: 'Repaint removed — false positive', color: '#10b981', delay: 0 },
      { x: 5, y: 78, title: '🔗 Share link generated', sub: 'Valid 7 days · No login needed', color: '#14b8a6', delay: 400 },
    ],
    bgAccent: '#10b981',
  },
  {
    id: 'customer-review',
    heading: 'Customer opens link on their phone.',
    sub: 'No signup required. Reviews each finding. Agrees or disputes with a note.',
    panels: {
      driverDoor: { color: '#065f46', glow: true },
      frontBumper: { color: '#065f46', glow: true },
      frontWheel: { color: '#065f46', glow: true },
    },
    person1: { x: 2, signing: true, label: 'Owner (signed)' },
    person2: { x: 88, label: 'Customer reviewing...' },
    floats: [
      { x: 35, y: 8, title: 'Customer view', sub: 'Public link · No account needed', color: '#6366f1', delay: 0 },
      { x: 72, y: 78, title: '✓ Agreed — scratch', sub: 'Confirmed by customer', color: '#10b981', delay: 300 },
      { x: 72, y: 65, title: '✓ Agreed — rim damage', sub: 'Confirmed by customer', color: '#10b981', delay: 600 },
    ],
    bgAccent: '#6366f1',
  },
  {
    id: 'both-sign',
    heading: 'Customer signs. Report locked.',
    sub: 'SHA-256 hash generated from both signatures + all damage data. Immutable forever.',
    panels: {
      driverDoor: { color: '#065f46', glow: true },
      frontBumper: { color: '#065f46', glow: true },
      frontWheel: { color: '#065f46', glow: true },
      rearWheel: { color: '#065f46', glow: true },
      roof: { color: '#065f46', glow: true },
    },
    person1: { x: 2, signing: true, label: '✓ Owner signed' },
    person2: { x: 88, signing: true, label: '✓ Customer signed' },
    seal: true,
    bgAccent: '#10b981',
  },
  {
    id: 'post-rental',
    heading: 'After rental: post-inspection auto-compares.',
    sub: 'AI compares pre vs post. Only NEW damage flagged. Zero ambiguity.',
    panels: {
      rearBumper: { damaged: true },
      trunk: { color: '#991b1b' },
    },
    person1: { x: 2, recording: true, label: 'Post-inspection' },
    damages: [
      { x: 78, y: 55, label: '🆕 New crack — rear bumper', severity: 'severe', delay: 300 },
    ],
    floats: [
      { x: 5, y: 8, title: 'AI comparison', sub: 'Pre vs Post — same vehicle', color: '#14b8a6' },
      { x: 5, y: 78, title: '🛡️ Legally proven', sub: 'Pre-existing items excluded', color: '#10b981', delay: 500 },
    ],
    bgAccent: '#ef4444',
  },
  {
    id: 'cta',
    heading: 'Every car deal. Verified. Trusted.',
    sub: 'Both parties signed. SHA-256 sealed. Dispute-proof forever.',
    panels: {
      driverDoor: { color: '#0f766e', glow: true },
      hood: { color: '#0f766e', glow: true },
      roof: { color: '#0f766e', glow: true },
      trunk: { color: '#0f766e', glow: true },
      frontBumper: { color: '#0f766e', glow: true },
      rearBumper: { color: '#0f766e', glow: true },
    },
    person1: { x: 2, signing: true, label: 'Owner' },
    person2: { x: 88, signing: true, label: 'Customer' },
    floats: [
      { x: 25, y: 8, title: '60 seconds', sub: 'Any phone', color: '#14b8a6' },
      { x: 42, y: 8, title: 'Grade A–F', sub: 'Evidence photos', color: '#6366f1', delay: 200 },
      { x: 60, y: 8, title: 'SHA-256 sealed', sub: 'Tamper-proof', color: '#10b981', delay: 400 },
    ],
    bgAccent: '#14b8a6',
  },
]

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function PitchDeck() {
  const [step, setStep] = useState(0)
  const scene = SCENES[step]

  const go = useCallback((n: number) => setStep(Math.max(0, Math.min(SCENES.length - 1, n))), [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(step + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(step - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [step, go])

  // Touch swipe
  useEffect(() => {
    let sx = 0
    const start = (e: TouchEvent) => { sx = e.touches[0].clientX }
    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx
      if (Math.abs(dx) > 50) go(dx < 0 ? step + 1 : step - 1)
    }
    window.addEventListener('touchstart', start)
    window.addEventListener('touchend', end)
    return () => { window.removeEventListener('touchstart', start); window.removeEventListener('touchend', end) }
  }, [step, go])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#040c18]"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Animated background glow */}
      <div className="absolute inset-0 transition-all duration-1000 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 120%, ${scene.bgAccent}08 0%, transparent 60%)` }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,0.04) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-sm tracking-tight">AutoAuditAI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-xs">{step + 1} / {SCENES.length}</span>
          <span className="text-slate-700 text-xs hidden sm:block">{scene.id}</span>
        </div>
      </div>

      {/* MAIN SCENE */}
      <div className="absolute inset-0 flex flex-col justify-end" style={{ paddingBottom: '80px' }}>

        {/* Story text — top */}
        <div className="absolute top-16 left-0 right-0 text-center px-8 z-30 pointer-events-none">
          <h1 key={scene.heading} className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 transition-all duration-500"
            style={{ textShadow: `0 0 40px ${scene.bgAccent}40` }}>
            {scene.heading}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {scene.sub}
          </p>
        </div>

        {/* Scene container — car + people + overlays */}
        <div className="relative w-full" style={{ height: '55vh', maxHeight: '380px' }}>

          {/* CAR */}
          <div className="absolute inset-x-[5%] inset-y-0 transition-all duration-700">
            <Car panels={scene.panels} className="w-full h-full" />
          </div>

          {/* DAMAGE MARKERS */}
          {scene.damages?.map((d, i) => (
            <DamagePin key={i} {...d} visible={true} />
          ))}

          {/* FLOAT CARDS */}
          {scene.floats?.map((f, i) => (
            <FloatCard key={i} {...f} visible={true} />
          ))}

          {/* WALK ARROWS */}
          {scene.arrows?.map((a, i) => (
            <WalkArrow key={i} {...a} visible={true} />
          ))}

          {/* GRADE */}
          {scene.grade && <GradeCircle visible={true} grade="B" />}

          {/* HASH SEAL */}
          {scene.seal && <HashSeal visible={true} />}

          {/* PERSON 1 */}
          {scene.person1 && <Person {...scene.person1} />}

          {/* PERSON 2 */}
          {scene.person2 && <Person {...scene.person2} />}

          {/* Ground line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
        </div>
      </div>

      {/* CTA special on last slide */}
      {step === SCENES.length - 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-50">
          <a href="https://autoauditai.com" target="_blank" rel="noopener noreferrer"
            className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-xl shadow-teal-500/30">
            Try it live →
          </a>
          <button onClick={() => go(0)}
            className="bg-white/8 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/12 transition-all">
            Restart
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-black/30 backdrop-blur-sm flex items-center px-4 gap-3 z-50">
        <button onClick={() => go(step - 1)} disabled={step === 0}
          className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 border border-white/8 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto py-2">
          {SCENES.map((s, i) => (
            <button key={i} onClick={() => go(i)} title={s.id}
              className="flex-shrink-0 transition-all duration-300 rounded-full"
              style={{
                width: i === step ? '32px' : '8px',
                height: '8px',
                background: i === step ? (scene.bgAccent || '#14b8a6') : 'rgba(255,255,255,0.15)',
                boxShadow: i === step ? `0 0 8px ${scene.bgAccent}80` : 'none',
              }} />
          ))}
        </div>

        <button onClick={() => go(step + 1)} disabled={step === SCENES.length - 1}
          className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 border border-white/8 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20">
          <ChevronRight className="w-4 h-4" />
        </button>

        {step < SCENES.length - 1 && (
          <div className="text-slate-700 text-xs hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-white/8 text-slate-600">→</kbd> next
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-0 h-0.5 transition-all duration-500"
        style={{ width: `${((step + 1) / SCENES.length) * 100}%`, background: scene.bgAccent }} />
    </div>
  )
}
