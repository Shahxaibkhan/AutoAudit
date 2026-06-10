'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, ScanLine, Lock, Shield, Zap, Building2, Eye } from 'lucide-react'

/* ─── Helpers ───────────────────────────────────────────────────────── */
function useCounter(target: number, active: boolean, duration = 1500) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) return
    let s = 0; const step = target / (duration / 16)
    const t = setInterval(() => { s += step; if (s >= target) { setV(target); clearInterval(t) } else setV(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [active, target, duration])
  return v
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{ width: (Math.random()*2+1)+'px', height: (Math.random()*2+1)+'px', left: Math.random()*100+'%', top: Math.random()*100+'%',
            background: i%3===0?'#14b8a6':i%3===1?'#6366f1':'#f59e0b', opacity: Math.random()*0.35+0.05,
            animation: `twinkle ${Math.random()*6+3}s ease-in-out ${Math.random()*4}s infinite alternate` }} />
      ))}
    </div>
  )
}

function GridBg({ c = '14,184,166', o = 0.04 }: { c?: string; o?: number }) {
  return <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(${c},${o}) 1px,transparent 1px),linear-gradient(90deg,rgba(${c},${o}) 1px,transparent 1px)`, backgroundSize: '56px 56px' }} />
}

function Glow({ pos, color = '#14b8a6' }: { pos: string; color?: string }) {
  return <div className={`absolute ${pos} w-[500px] h-[500px] rounded-full pointer-events-none`} style={{ background: color, opacity: 0.07, filter: 'blur(100px)' }} />
}

/* arrow between flow steps */
function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="flex items-center">
        <div className="w-8 h-px bg-teal-500/50" />
        <div className="border-t border-r border-teal-500/50 w-2 h-2 rotate-45 -ml-1" />
      </div>
      {label && <span className="text-[10px] text-teal-500/60 font-medium whitespace-nowrap">{label}</span>}
    </div>
  )
}

function FlowBox({ icon, label, sub, accent = 'teal', highlight = false }: { icon: string; label: string; sub?: string; accent?: string; highlight?: boolean }) {
  const colors: Record<string, string> = { teal: 'border-teal-500/40 bg-teal-500/8', indigo: 'border-indigo-500/40 bg-indigo-500/8', amber: 'border-amber-500/40 bg-amber-500/8', emerald: 'border-emerald-500/40 bg-emerald-500/8', red: 'border-red-500/40 bg-red-500/8' }
  return (
    <div className={`border ${colors[accent] || colors.teal} ${highlight ? 'ring-2 ring-teal-400/30 scale-105' : ''} rounded-xl px-3 py-3 text-center min-w-[90px] backdrop-blur-sm transition-all`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-white text-xs font-bold leading-tight">{label}</div>
      {sub && <div className="text-slate-500 text-[10px] mt-0.5 leading-tight">{sub}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIDES
═══════════════════════════════════════════════════════════════════════ */

function S1_Title({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center px-8 overflow-hidden">
      <GridBg c="99,102,241" o={0.05} />
      <Particles />
      <Glow pos="-top-32 -left-20" color="#14b8a6" />
      <Glow pos="-bottom-32 -right-20" color="#6366f1" />

      <div className={`relative transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/40 ring-1 ring-teal-400/30">
            <ScanLine className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <div className="text-white text-2xl font-black tracking-tight leading-none">AutoAuditAI</div>
            <div className="text-teal-400 text-xs font-semibold tracking-widest uppercase mt-0.5">Vehicle Inspection Platform</div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
          LCE LUMS Cohort-4 · June 16, 2026
        </div>

        <h1 className="text-[72px] sm:text-8xl font-black text-white leading-[0.9] mb-6 tracking-tight">
          The trust layer for<br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-500 bg-clip-text text-transparent">every car deal.</span>
            <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
          </span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          AI-powered vehicle inspection in 60 seconds — for buyers, sellers, rental businesses, and dealers.
          Both parties sign. Reports are tamper-proof.
        </p>

        <div className="flex items-center justify-center gap-8 text-sm">
          {[['🌍','Available worldwide'],['⚡','60 seconds'],['🔒','SHA-256 verified'],['📱','Any phone']].map(([i, l]) => (
            <div key={l as string} className="flex items-center gap-1.5 text-slate-500">{i} {l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function S2_Problem({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="239,68,68" />
      <Glow pos="-top-40 -right-20" color="#ef4444" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">The Problem</div>
        <h2 className="text-[52px] font-black text-white mb-2 leading-tight">Every car transaction starts<br />with the <span className="text-red-400">same fear.</span></h2>
        <p className="text-slate-400 text-lg mb-8">Trust is broken — and it costs everyone money.</p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { who: 'Used Car Buyer', icon: '🔍', q: '"Is this car hiding damage I can\'t see?"', cost: 'Pays $50–150 + waits 2 days for manual inspection', accent: 'border-red-500/25 bg-red-500/5' },
            { who: 'Rental Owner', icon: '🚗', q: '"How do I prove this dent wasn\'t there before?"', cost: 'Loses $300–500+ per disputed damage claim', accent: 'border-amber-500/25 bg-amber-500/5' },
            { who: 'Used Car Seller', icon: '💰', q: '"How do I prove my car is clean to buyers?"', cost: 'Sells $500–2,000 below market due to trust gap', accent: 'border-orange-500/25 bg-orange-500/5' },
          ].map((c, i) => (
            <div key={i} className={`border ${c.accent} rounded-2xl p-5 backdrop-blur-sm`}
              style={{ transitionDelay: active?`${i*100}ms`:'0ms', opacity: active?1:0, transform: active?'translateY(0)':'translateY(20px)', transition: 'opacity 0.4s, transform 0.4s' }}>
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{c.who}</div>
              <p className="text-white font-semibold text-sm mb-3 leading-snug italic">&ldquo;{c.q}&rdquo;</p>
              <div className="text-slate-500 text-xs leading-relaxed border-t border-white/6 pt-3">{c.cost}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white/3 border border-white/8 rounded-xl px-5 py-3 inline-flex items-center gap-3">
          <span className="text-red-400 font-bold">Manual inspection:</span>
          <span className="text-slate-400 text-sm">$50–150 fee · 1–2 days wait · Only available in major cities · Paper report, easily faked</span>
        </div>
      </div>
    </div>
  )
}

function S3_B2CFlow({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="20,184,166" />
      <Glow pos="-bottom-32 left-1/4" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> B2C Flow
          </div>
          <div className="text-xs text-slate-500">For buyers &amp; sellers</div>
        </div>
        <h2 className="text-[48px] font-black text-white mb-2 leading-tight">Used car buying/selling —<br /><span className="text-teal-400">trust built in 60 seconds.</span></h2>
        <p className="text-slate-400 text-base mb-8">No signup required for the buyer. No expert needed. Fully anonymous.</p>

        {/* B2C Buyer Flow */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-500/60 mb-3">🛒 Buyer wants to inspect a car before paying</div>
          <div className="flex items-center gap-2 flex-wrap">
            <FlowBox icon="📱" label="Opens app" sub="No signup" accent="teal" />
            <Arrow />
            <FlowBox icon="🎯" label="Buyer Inspection" sub="Selects flow" accent="teal" />
            <Arrow />
            <FlowBox icon="🎬" label="Records 60s" sub="Walks around car" accent="teal" />
            <Arrow />
            <FlowBox icon="🤖" label="AI Analyzes" sub="All damage types" accent="teal" highlight />
            <Arrow />
            <FlowBox icon="📊" label="Grade A-F" sub="Evidence photos" accent="teal" />
            <Arrow />
            <FlowBox icon="💬" label="Share report" sub="WhatsApp/link" accent="emerald" />
            <Arrow />
            <FlowBox icon="✅" label="Both sign" sub="SHA-256 locked" accent="emerald" highlight />
          </div>
        </div>

        {/* B2C Seller Flow */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-500/60 mb-3">🏷️ Seller wants to prove car condition to buyers</div>
          <div className="flex items-center gap-2 flex-wrap">
            <FlowBox icon="📷" label="Seller inspects" sub="Own vehicle" accent="amber" />
            <Arrow />
            <FlowBox icon="🤖" label="AI Report" sub="Grade + findings" accent="amber" />
            <Arrow />
            <FlowBox icon="📄" label="Shareable link" sub="Public URL" accent="amber" />
            <Arrow />
            <FlowBox icon="👥" label="Buyers verify" sub="Before offering" accent="amber" />
            <Arrow />
            <FlowBox icon="📈" label="Higher offer" sub="Trust = value" accent="amber" highlight />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {[['🔒','Anonymous','Sellers never know who checked'],['⚡','Instant','60-second video → report in 2 min'],['📱','Any phone','iOS + Android, no app needed']].map(([i,t,d]) => (
            <div key={t as string} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3">
              <span className="text-lg mr-2">{i}</span><span className="text-white font-semibold">{t}</span>
              <div className="text-slate-500 text-xs mt-1">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function S4_B2BFlow({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="99,102,241" />
      <Glow pos="-top-32 right-0" color="#6366f1" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> B2B Flow
          </div>
          <div className="text-xs text-slate-500">For rental businesses &amp; fleet managers</div>
        </div>
        <h2 className="text-[48px] font-black text-white mb-2 leading-tight">Rental / fleet loop —<br /><span className="text-indigo-400">zero disputes, forever.</span></h2>
        <p className="text-slate-400 text-base mb-7">Both parties sign before AND after. New damage is mathematically proven.</p>

        {/* Pre-rental flow */}
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400/60 mb-2">Before rental — Pre-inspection</div>
          <div className="flex items-center gap-2">
            <FlowBox icon="🚗" label="Vehicle" sub="Fleet car" accent="indigo" />
            <Arrow />
            <FlowBox icon="🎬" label="Owner records" sub="60s walkaround" accent="indigo" />
            <Arrow />
            <FlowBox icon="🤖" label="AI detects" sub="All damage" accent="indigo" />
            <Arrow />
            <FlowBox icon="🔍" label="Owner reviews" sub="Confirm/edit" accent="indigo" />
            <Arrow />
            <FlowBox icon="✍️" label="Owner signs" sub="Timestamp" accent="indigo" highlight />
            <Arrow label="Share link" />
            <FlowBox icon="👤" label="Renter reviews" sub="No login needed" accent="indigo" />
            <Arrow />
            <FlowBox icon="🔐" label="Renter signs" sub="SHA-256 sealed" accent="emerald" highlight />
          </div>
        </div>

        {/* Post-rental flow */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400/60 mb-2">After rental — Post-inspection + auto-compare</div>
          <div className="flex items-center gap-2">
            <FlowBox icon="📸" label="Post-inspect" sub="Same vehicle" accent="emerald" />
            <Arrow />
            <FlowBox icon="🤖" label="AI compares" sub="Pre vs Post" accent="emerald" />
            <Arrow />
            <FlowBox icon="🆕" label="New damage only" sub="AI filters pre-existing" accent="emerald" highlight />
            <Arrow />
            <FlowBox icon="💰" label="Charge renter" sub="With proof" accent="amber" highlight />
            <Arrow />
            <FlowBox icon="✅" label="Zero disputes" sub="Both signed" accent="emerald" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[['🔒','Tamper-proof','SHA-256 hash locks the report'],['👥','Both parties','Owner + renter both sign'],['📊','Auto-compare','AI finds new damage only'],['⚡','60 seconds','Total time per inspection']].map(([i,t,d]) => (
            <div key={t as string} className="bg-white/4 border border-white/8 rounded-xl px-3 py-3 text-center">
              <div className="text-xl mb-1">{i}</div>
              <div className="text-white font-bold text-xs">{t}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function S5_SignatureFlow({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="16,185,129" />
      <Glow pos="-bottom-32 left-1/3" color="#10b981" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Dual Signature System
          </div>
        </div>
        <h2 className="text-[48px] font-black text-white mb-2 leading-tight">The verification chain —<br /><span className="text-emerald-400">mathematically tamper-proof.</span></h2>
        <p className="text-slate-400 text-base mb-8">No more "he said, she said." Both parties' signatures create an immutable record.</p>

        {/* Main flow */}
        <div className="flex items-start gap-4 mb-6">
          {[
            { n:'1', title:'AI Analyzes', desc:'Detects all visible damage — scratches, dents, repaint, rim damage, headlight fog', color:'bg-slate-800 border-white/10', icon:'🤖' },
            { n:'2', title:'Owner Reviews', desc:'Confirm each finding, edit descriptions, remove false positives, add missed damage', color:'bg-indigo-950 border-indigo-500/30', icon:'✍️' },
            { n:'3', title:'Owner Signs', desc:'Digital signature + timestamp. Share link generated — expires in 7 days', color:'bg-teal-950 border-teal-500/30', icon:'🔗' },
            { n:'4', title:'Customer Reviews', desc:'Opens link on phone. No signup required. Agrees or disputes each finding', color:'bg-indigo-950 border-indigo-500/30', icon:'👤' },
            { n:'5', title:'Customer Signs', desc:'Both signatures collected. SHA-256 hash generated from all data', color:'bg-emerald-950 border-emerald-500/30', icon:'🔐' },
            { n:'6', title:'Report Locked', desc:'Immutable. Tamper-proof. Downloadable PDF with both signatures and hash', color:'bg-emerald-950 border-emerald-500/50', icon:'🔒' },
          ].map((s, i) => (
            <div key={i} className={`flex-1 border ${s.color} rounded-xl p-3.5 backdrop-blur-sm relative`}
              style={{ opacity: active?1:0, transform: active?'translateY(0)':'translateY(20px)', transition: `opacity 0.4s ${i*80}ms, transform 0.4s ${i*80}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-slate-600">{s.n}</span>
                <span className="text-base">{s.icon}</span>
              </div>
              <div className="text-white font-bold text-xs mb-1.5">{s.title}</div>
              <div className="text-slate-500 text-[11px] leading-relaxed">{s.desc}</div>
              {i < 5 && <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-teal-500/50 text-lg z-10">›</div>}
            </div>
          ))}
        </div>

        {/* Hash explanation */}
        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-4">
          <Lock className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-bold mb-1">SHA-256 Verification Hash</div>
            <div className="font-mono text-emerald-400/70 text-xs mb-2">7d4f9e2a3c8b1f6d4e8b2c9a1f3d5e7b2a4c6e8f0...</div>
            <div className="text-slate-400 text-sm">Generated from inspection ID, vehicle details, both signatures, and all damage states. If any data changes after signing — the hash won&apos;t match. <span className="text-emerald-400 font-semibold">Dispute resolved instantly.</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function S6_AIDetection({ active }: { active: boolean }) {
  const types = [
    { icon:'🔴', label:'Scratches & Dents', desc:'Depth, severity, panel location', c:'border-red-500/30 bg-red-500/5' },
    { icon:'🎨', label:'Repaint Detection', desc:'Color mismatch, overspray on rubber seals', c:'border-amber-500/30 bg-amber-500/5' },
    { icon:'📐', label:'Panel Misalignment', desc:'Uneven gaps = previous accident repair', c:'border-orange-500/30 bg-orange-500/5' },
    { icon:'🔵', label:'Rim / Curb Rash', desc:'Metal alloy damage (not tyre marks)', c:'border-blue-500/30 bg-blue-500/5' },
    { icon:'💡', label:'Headlight Clarity', desc:'Fogging, yellowing, UV oxidation', c:'border-yellow-500/30 bg-yellow-500/5' },
    { icon:'🔩', label:'Rust & Corrosion', desc:'Panel, chassis, trim detection', c:'border-slate-500/30 bg-slate-500/5' },
    { icon:'💥', label:'Cracks & Breaks', desc:'Glass, bumpers, plastic housing', c:'border-purple-500/30 bg-purple-500/5' },
    { icon:'🏷️', label:'Multi-frame Consensus', desc:'Same damage in 2+ frames = confirmed', c:'border-teal-500/30 bg-teal-500/5' },
  ]
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="245,158,11" />
      <Glow pos="-top-32 right-0" color="#f59e0b" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> AI Detection
          </div>
          <div className="text-xs text-slate-500">What competitors miss — we catch</div>
        </div>
        <h2 className="text-[48px] font-black text-white mb-2 leading-tight">Advanced AI pipeline —<br /><span className="text-amber-400">not a chatbot wrapper.</span></h2>
        <p className="text-slate-400 text-base mb-6">Specialized models per detection type. Multi-frame consensus eliminates false positives.</p>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {types.map((t, i) => (
            <div key={i} className={`border ${t.c} rounded-xl p-4 backdrop-blur-sm`}
              style={{ opacity: active?1:0, transform: active?'translateY(0)':'translateY(15px)', transition: `opacity 0.3s ${i*60}ms, transform 0.3s ${i*60}ms` }}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-white font-bold text-xs mb-1">{t.label}</div>
              <div className="text-slate-500 text-[11px]">{t.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex-1 bg-white/4 border border-teal-500/20 rounded-xl px-4 py-3">
            <span className="text-teal-400 font-bold">Gemini 2.5 Flash</span>
            <span className="text-slate-500 ml-2">Frame analysis · Panel ID · Report generation</span>
          </div>
          <div className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
            <span className="text-slate-300 font-bold">Multi-frame Consensus</span>
            <span className="text-slate-500 ml-2">Damage must appear in 2+ frames to count</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function S7_Market({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="245,158,11" />
      <Glow pos="-bottom-32 right-0" color="#f59e0b" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-3">Market Opportunity</div>
        <h2 className="text-[52px] font-black text-white mb-2 leading-tight">A massive, underserved<br /><span className="text-amber-400">emerging market.</span></h2>
        <p className="text-slate-400 text-lg mb-8">Starting in South &amp; SE Asia. Built to scale globally.</p>

        <div className="grid grid-cols-3 gap-5 mb-6">
          {[
            { l:'TAM', s:'Global', v:'$8B+', d:'Vehicle inspection market worldwide', c:'border-slate-600/50 text-slate-300' },
            { l:'SAM', s:'Target regions', v:'$500M', d:'South Asia + SE Asia + GCC', c:'border-teal-500/40 text-teal-300' },
            { l:'SOM', s:'3-year target', v:'$15M', d:'Initial markets, 10% adoption', c:'border-amber-500/40 text-amber-300' },
          ].map((m, i) => (
            <div key={i}
              className={`border ${m.c} bg-white/3 rounded-2xl p-6 text-center backdrop-blur-sm`}
              style={{ opacity: active?1:0, transition: `opacity 0.5s ${i*120}ms` }}>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{m.s}</div>
              <div className={`text-5xl font-black ${m.c} mb-2`}>{m.v}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{m.l}</div>
              <div className="text-slate-500 text-sm">{m.d}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {[['🇵🇰 Pakistan','700k+ used car sales/year · 10% adoption = $5M'],['🇮🇩 Indonesia','1.1M used car market · Fastest growing SE Asia'],['🇲🇾 Malaysia','600k+ transactions/year · Strong digital adoption']].map(([t,d]) => (
            <div key={t as string} className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <div className="text-white font-bold mb-1">{t}</div>
              <div className="text-slate-500 text-xs">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function S8_BusinessModel({ active }: { active: boolean }) {
  const margin = useCounter(97, active)
  const cost = useCounter(10, active, 1000)
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="99,102,241" />
      <Glow pos="-top-32 -left-20" color="#6366f1" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400 mb-3">Business Model</div>
        <h2 className="text-[52px] font-black text-white mb-2 leading-tight">
          <span className="text-violet-400">{margin}%</span> gross margin.{' '}
          <span className="text-slate-400 text-4xl">Cost ~${cost}¢/inspection.</span>
        </h2>
        <p className="text-slate-400 text-lg mb-7">Two revenue streams. One platform.</p>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white/4 border border-teal-500/20 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> B2C — Per Inspection
            </div>
            {[['🔍 Quick Scan','$0.99','Fast AI screening'],['📊 Standard','$1.99','Full report + photos'],['🎨 Pro','$3.99','+ Repaint + panel gap'],['🔒 With Signatures','$4.99','Dual-sign + hash']].map(([n,p,d]) => (
              <div key={n as string} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div><div className="text-white text-sm font-semibold">{n}</div><div className="text-slate-500 text-xs">{d}</div></div>
                <div className="text-teal-300 font-bold">{p}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/4 border border-indigo-500/20 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> B2B — Monthly Subscription
            </div>
            {[['Starter','$19/mo','50 inspections'],['Growth','$49/mo','200 inspections'],['Pro','$99/mo','600 inspections'],['Enterprise','Custom','Unlimited + white-label']].map(([n,p,d]) => (
              <div key={n as string} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div><div className="text-white text-sm font-semibold">{n}</div><div className="text-slate-500 text-xs">{d}</div></div>
                <div className="text-indigo-300 font-bold">{p}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          {[['Cost per analysis','~$0.10 (AI API)'],['Avg B2C sale','$1.99–4.99'],['Avg B2B/inspection','$0.24–0.49'],['Gross margin','~97%']].map(([l,v]) => (
            <div key={l as string} className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-center">
              <div className="text-xs text-slate-500 mb-1">{l}</div>
              <div className="text-white font-bold">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function S9_Traction({ active }: { active: boolean }) {
  const built = ['✓ Full product live at autoauditai.com','✓ Dual-signature with SHA-256 tamper-proof hash','✓ AI detects: repaint, rim damage, panel misalignment, headlight fog','✓ Video + photo capture with blur/quality/pHash filtering','✓ Before/after comparison engine (rental loop)','✓ Multi-language: English, Urdu, Bahasa Indonesia, Bahasa Melayu','✓ Admin panel + billing + demo accounts']
  const next = ['→ 10 pilot rental customers (active outreach)','→ AI accuracy benchmarked on 100+ real vehicles','→ First $2,000 in revenue','→ JazzCash / Easypaisa integration','→ Second market soft launch']
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="16,185,129" />
      <Glow pos="-bottom-20 right-1/4" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3">Traction</div>
        <h2 className="text-[52px] font-black text-white mb-6 leading-tight">From idea to full product —<br /><span className="text-emerald-400">ahead of competition.</span></h2>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Built &amp; Shipped</div>
            <div className="space-y-2">
              {built.map((item, i) => (
                <div key={i} className="text-slate-300 text-sm flex items-start gap-2"
                  style={{ opacity: active?1:0, transition: `opacity 0.3s ${i*50}ms` }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Next 90 Days</div>
            <div className="space-y-2">
              {next.map((item, i) => (
                <div key={i} className="text-amber-300/80 text-sm"
                  style={{ opacity: active?1:0, transition: `opacity 0.3s ${(i+7)*50}ms` }}>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white/4 border border-white/8 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2">Validating with first pilot customers</div>
              <div className="text-white font-bold">Note: Early-stage. Pilot phase begins June 2026.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function S10_Competition({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="239,68,68" />
      <Glow pos="-top-32 left-0" color="#ef4444" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">Competition</div>
        <h2 className="text-[52px] font-black text-white mb-2">Nobody offers <span className="text-teal-400">dual-signature</span><br />at this price point.</h2>
        <p className="text-slate-400 text-lg mb-8">Competitors detect damage. We build trust between two parties.</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { name:'PakWheels Inspect', price:'$15–40', speed:'2 days', sig:'❌ No signature', gap:'Manual, no comparison' },
            { name:'Tractable / Ravin', price:'$100+', speed:'Insurance only', sig:'❌ Enterprise only', gap:'Not for individuals' },
            { name:'Workshop Check', price:'$10–30', speed:'Half day', sig:'❌ Paper receipt', gap:'No AI, no digital proof' },
            { name:'AutoAuditAI ✦', price:'$1–5', speed:'60 seconds', sig:'✅ Dual signature', gap:'SHA-256 tamper-proof', highlight: true },
          ].map((c, i) => (
            <div key={i}
              className={`rounded-2xl p-5 border backdrop-blur-sm ${(c as { highlight?: boolean }).highlight ? 'border-teal-500/50 bg-teal-500/8 ring-2 ring-teal-400/20' : 'border-white/8 bg-white/4'}`}>
              <div className={`text-sm font-black mb-4 ${(c as { highlight?: boolean }).highlight ? 'text-teal-400' : 'text-white'}`}>{c.name}</div>
              {[['Price',c.price],['Speed',c.speed],['Signatures',c.sig],['Gap',c.gap]].map(([l,v]) => (
                <div key={l as string} className="mb-2.5">
                  <div className="text-slate-600 text-[10px] uppercase tracking-widest">{l}</div>
                  <div className={`text-xs font-semibold ${(c as { highlight?: boolean }).highlight ? 'text-slate-200' : 'text-slate-400'}`}>{v}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-4 text-sm">
          <span className="text-teal-400 font-bold">Our moat: </span>
          <span className="text-slate-300">The dual-signature + SHA-256 hash creates a legal-grade record that both parties stand behind. No competitor offers this for under $5.</span>
        </div>
      </div>
    </div>
  )
}

function S11_Team({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center items-center text-center px-14 overflow-hidden">
      <GridBg />
      <Glow pos="-top-32 left-1/3" />
      <Glow pos="-bottom-32 right-1/3" color="#6366f1" />

      <div className={`transition-all duration-500 max-w-2xl ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-teal-400 mb-6">Team</div>
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-5 shadow-2xl shadow-teal-500/30 ring-4 ring-teal-500/20">
          SK
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Shahzaib Khan · Founder & CEO</div>
        <h2 className="text-4xl font-black text-white mb-2">Solo founder.<br /><span className="text-teal-400">Shipped fast. Coachable.</span></h2>
        <p className="text-slate-400 text-lg mb-7">Built AutoAuditAI from concept to full deployed product using AI-assisted development (Claude Code). Deep understanding of vehicle rental &amp; inspection markets.</p>

        <div className="grid grid-cols-2 gap-3 text-left">
          {['✓ Full-stack product shipped solo in weeks','✓ Product live and tested on real vehicles','✓ Building in public — iterate fast, ship faster','✓ Seeking mentorship + first 10 B2B customers'].map((item, i) => (
            <div key={i} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-300"
              style={{ opacity: active?1:0, transition: `opacity 0.4s ${i*100}ms` }}>
              {item}
            </div>
          ))}
        </div>

        <div className="mt-5 text-slate-600 text-sm">
          Actively hiring: Sales lead · ML engineer · Customer success
        </div>
      </div>
    </div>
  )
}

function S12_Roadmap({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col justify-center px-14 overflow-hidden">
      <GridBg c="99,102,241" />
      <Glow pos="-bottom-20 left-0" color="#6366f1" />

      <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-3">Roadmap &amp; Ask</div>
        <h2 className="text-[52px] font-black text-white mb-7 leading-tight">Where we&apos;re going.<br /><span className="text-indigo-400">What we need from LCE.</span></h2>

        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            { q:'Q3 2026', t:'Validate', c:'border-teal-500/40 text-teal-400', items:['10 pilot customers','AI accuracy benchmarks','First $5k revenue'] },
            { q:'Q4 2026', t:'Scale Pakistan', c:'border-indigo-500/40 text-indigo-400', items:['100+ customers','JazzCash integration','Karachi + Islamabad'] },
            { q:'2027', t:'Regional', c:'border-amber-500/40 text-amber-400', items:['1,000+ customers','Indonesia + Malaysia','Series Seed round'] },
          ].map((p, i) => (
            <div key={i} className={`border ${p.c} bg-white/4 rounded-2xl p-5`}
              style={{ opacity: active?1:0, transition: `opacity 0.4s ${i*120}ms` }}>
              <div className={`text-xs font-bold ${p.c} mb-1`}>{p.q}</div>
              <div className="text-white font-black text-xl mb-3">{p.t}</div>
              {p.items.map((item,j) => (
                <div key={j} className="text-slate-400 text-sm py-1.5 border-b border-white/5 last:border-0">• {item}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Our Ask from LCE</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2 text-slate-300"><span className="text-teal-400 text-lg">🤝</span><div><div className="font-semibold">Mentorship</div><div className="text-slate-500 text-xs">B2B sales strategy + pricing</div></div></div>
            <div className="flex items-start gap-2 text-slate-300"><span className="text-teal-400 text-lg">🏢</span><div><div className="font-semibold">Industry intros</div><div className="text-slate-500 text-xs">Rental companies &amp; dealerships</div></div></div>
            <div className="flex items-start gap-2 text-slate-300"><span className="text-teal-400 text-lg">🚀</span><div><div className="font-semibold">First 50 customers</div><div className="text-slate-500 text-xs">Pilot program support</div></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function S13_Closing({ active }: { active: boolean }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center px-8 overflow-hidden">
      <GridBg c="99,102,241" o={0.06} />
      <Particles />
      <Glow pos="-top-32 -left-20" color="#14b8a6" />
      <Glow pos="-bottom-32 -right-20" color="#6366f1" />
      <Glow pos="top-1/3 left-1/3" color="#f59e0b" />

      <div className={`relative transition-all duration-700 max-w-4xl ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-slate-400 text-xl mb-4">In 3 years,</div>
        <h1 className="text-7xl sm:text-8xl font-black leading-[0.9] mb-4">
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            every car deal
          </span>
          <br />
          <span className="text-white">will be verified by AI.</span>
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">
            Both parties. Signed. Sealed.
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          We&apos;re building the trust infrastructure for the emerging market vehicle economy.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <a href="https://autoauditai.com" target="_blank" rel="noopener noreferrer"
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5 shadow-2xl shadow-teal-500/30">
            Try live: autoauditai.com →
          </a>
          <a href="/pitch" className="bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all backdrop-blur-sm">
            Restart deck
          </a>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
          {[['🔐','SHA-256 verified reports'],['👥','Dual-signature workflow'],['🤖','8+ AI detection types'],['📱','60 seconds, any phone']].map(([i,l]) => (
            <span key={l as string} className="flex items-center gap-1.5">{i} {l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Deck ───────────────────────────────────────────────────────────── */
const SLIDES = [
  { id:'title',     label:'AutoAuditAI',           Component: S1_Title },
  { id:'problem',   label:'The Problem',            Component: S2_Problem },
  { id:'b2c',       label:'B2C Flow',               Component: S3_B2CFlow },
  { id:'b2b',       label:'B2B Flow',               Component: S4_B2BFlow },
  { id:'signature', label:'Dual Signature',         Component: S5_SignatureFlow },
  { id:'ai',        label:'AI Detection',           Component: S6_AIDetection },
  { id:'market',    label:'Market',                 Component: S7_Market },
  { id:'biz',       label:'Business Model',         Component: S8_BusinessModel },
  { id:'traction',  label:'Traction',               Component: S9_Traction },
  { id:'comp',      label:'Competition',            Component: S10_Competition },
  { id:'team',      label:'Team',                   Component: S11_Team },
  { id:'roadmap',   label:'Roadmap & Ask',          Component: S12_Roadmap },
  { id:'closing',   label:'The Vision',             Component: S13_Closing },
]

export default function PitchDeck() {
  const [cur, setCur] = useState(0)
  const [auto, setAuto] = useState(false)
  const iRef = useRef<NodeJS.Timeout | null>(null)

  const go = useCallback((n: number) => setCur(Math.max(0, Math.min(SLIDES.length - 1, n))), [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(cur + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(cur - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [cur, go])

  useEffect(() => {
    if (auto) { iRef.current = setInterval(() => setCur(c => c < SLIDES.length - 1 ? c + 1 : 0), 7000) }
    return () => { if (iRef.current) clearInterval(iRef.current) }
  }, [auto])

  const { Component } = SLIDES[cur]

  return (
    <div className="fixed inset-0 bg-[#040c18] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes twinkle { 0%{transform:translateY(0)translateX(0);opacity:0.1} 100%{transform:translateY(-25px)translateX(12px);opacity:0.4} }
      `}</style>

      {/* Active slide */}
      <div className="absolute inset-0 pb-12">
        <Component active={true} key={cur} />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-sm border-t border-white/5 flex items-center px-4 gap-3">
        <button onClick={() => go(cur - 1)} disabled={cur === 0}
          className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 border border-white/8 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto">
          {SLIDES.map((s, i) => (
            <button key={i} onClick={() => go(i)} title={s.label}
              className={`transition-all duration-300 rounded-full flex-shrink-0 ${i === cur ? 'w-16 h-2 bg-teal-400' : 'w-2 h-2 bg-white/15 hover:bg-white/35'}`} />
          ))}
        </div>

        <button onClick={() => go(cur + 1)} disabled={cur === SLIDES.length - 1}
          className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 border border-white/8 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20">
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-slate-700 text-xs">{SLIDES[cur].label}</span>
          <span className="text-slate-800 text-xs">{cur + 1}/{SLIDES.length}</span>
          <button onClick={() => setAuto(a => !a)}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${auto ? 'border-teal-500/50 bg-teal-500/15 text-teal-400' : 'border-white/10 bg-white/5 text-slate-600'}`}>
            {auto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()}
            className="w-6 h-6 rounded-md border border-white/10 bg-white/5 flex items-center justify-center text-slate-600 hover:text-white transition-all">
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-12 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-500"
        style={{ width: `${((cur + 1) / SLIDES.length) * 100}%` }} />

      {cur === 0 && (
        <div className="absolute bottom-14 right-4 text-xs text-slate-800 flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-white/8 bg-white/4 text-slate-600">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded border border-white/8 bg-white/4 text-slate-600">→</kbd>
          navigate
        </div>
      )}
    </div>
  )
}
