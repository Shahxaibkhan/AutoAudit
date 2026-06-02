'use client'
import { useState } from 'react'

export interface DiagramDamage {
  panelCode: string | null
  severity: string
  type: string
  description: string | null
}

/* ── Car outline path — 360×700 viewBox ─────────────────────────────────
   Traced clockwise from front-left. Wheel arches are elliptical concave
   arcs (sweep=0 on right side, sweep=1 on left side). ──────────────── */
const CAR_PATH =
  'M 115,18 Q 180,10 245,18 L 302,62 Q 328,74 334,105 ' +
  'A 44,42 0 0 0 334,193 Q 328,218 302,224 L 302,272 ' +
  'Q 318,276 324,284 L 324,452 Q 318,460 302,466 ' +
  'Q 328,476 334,508 A 44,42 0 0 0 334,596 ' +
  'Q 328,618 302,630 L 245,678 Q 180,688 115,678 ' +
  'L 58,630 Q 32,618 26,596 A 44,42 0 0 1 26,508 ' +
  'Q 32,476 58,466 Q 42,460 36,452 L 36,284 ' +
  'Q 42,276 58,272 L 58,224 Q 32,218 26,193 ' +
  'A 44,42 0 0 1 26,105 Q 32,74 58,62 Z'

/* ── Panel rectangles (clipped to CAR_PATH) ─────────────────────────── */
const PANEL_RECTS: Record<string, { x: number; y: number; w: number; h: number }> = {
  front_bumper:         { x: 0,   y: 0,   w: 360, h: 65  },
  hood:                 { x: 100, y: 65,  w: 160, h: 157 },
  front_left_fender:    { x: 0,   y: 65,  w: 100, h: 160 },
  front_right_fender:   { x: 260, y: 65,  w: 100, h: 160 },
  driver_mirror:        { x: 0,   y: 215, w: 48,  h: 28  },
  passenger_mirror:     { x: 312, y: 215, w: 48,  h: 28  },
  windshield:           { x: 100, y: 222, w: 160, h: 52  },
  roof:                 { x: 100, y: 274, w: 160, h: 178 },
  driver_door:          { x: 28,  y: 274, w: 72,  h: 89  },
  rear_driver_door:     { x: 28,  y: 363, w: 72,  h: 89  },
  passenger_door:       { x: 260, y: 274, w: 72,  h: 89  },
  rear_passenger_door:  { x: 260, y: 363, w: 72,  h: 89  },
  driver_rocker:        { x: 26,  y: 274, w: 14,  h: 178 },
  passenger_rocker:     { x: 320, y: 274, w: 14,  h: 178 },
  rear_window:          { x: 100, y: 452, w: 160, h: 52  },
  trunk_lid:            { x: 100, y: 504, w: 160, h: 126 },
  rear_left_quarter:    { x: 0,   y: 452, w: 100, h: 178 },
  rear_right_quarter:   { x: 260, y: 452, w: 100, h: 178 },
  rear_bumper:          { x: 0,   y: 630, w: 360, h: 70  },
}

const PANEL_LABELS: Record<string, string> = {
  front_bumper: 'Front Bumper', hood: 'Hood', windshield: 'Windshield',
  roof: 'Roof', trunk_lid: 'Boot / Trunk', rear_bumper: 'Rear Bumper',
  rear_window: 'Rear Window', driver_door: 'Driver Door',
  passenger_door: 'Passenger Door', rear_driver_door: 'Rear Driver Door',
  rear_passenger_door: 'Rear Pass Door', front_left_fender: 'FL Fender',
  front_right_fender: 'FR Fender', rear_left_quarter: 'RL Quarter',
  rear_right_quarter: 'RR Quarter', driver_mirror: 'Driver Mirror',
  passenger_mirror: 'Pass Mirror', driver_rocker: 'Driver Sill',
  passenger_rocker: 'Pass Sill',
}

/* ── Panel divider lines ─────────────────────────────────────────────── */
const DIVIDERS = [
  // horizontal zone dividers
  { x1: 58,  y1: 224, x2: 302, y2: 224 },
  { x1: 58,  y1: 272, x2: 302, y2: 272 },
  { x1: 58,  y1: 452, x2: 302, y2: 452 },
  { x1: 58,  y1: 466, x2: 302, y2: 466 },
  { x1: 58,  y1: 630, x2: 302, y2: 630 },
  // vertical: fender/hood/trunk separators
  { x1: 100, y1: 65,  x2: 100, y2: 224 },
  { x1: 260, y1: 65,  x2: 260, y2: 224 },
  { x1: 100, y1: 274, x2: 100, y2: 452 },
  { x1: 260, y1: 274, x2: 260, y2: 452 },
  { x1: 100, y1: 466, x2: 100, y2: 630 },
  { x1: 260, y1: 466, x2: 260, y2: 630 },
  // B-pillar (door dividers)
  { x1: 28,  y1: 363, x2: 100, y2: 363 },
  { x1: 260, y1: 363, x2: 332, y2: 363 },
]

const FILL:   Record<string, string> = { severe: '#fecaca', moderate: '#fde68a', minor: '#bbf7d0' }
const STROKE: Record<string, string> = { severe: '#ef4444', moderate: '#f59e0b', minor: '#22c55e' }
const DOT:    Record<string, string> = { severe: 'bg-red-500', moderate: 'bg-amber-400', minor: 'bg-emerald-400' }

function worst(damages: DiagramDamage[]): string {
  if (damages.some(d => d.severity?.toLowerCase() === 'severe'))   return 'severe'
  if (damages.some(d => d.severity?.toLowerCase() === 'moderate')) return 'moderate'
  return 'minor'
}

export default function CarDiagram({ damages }: { damages: DiagramDamage[] }) {
  const [active, setActive] = useState<string | null>(null)

  const map = new Map<string, DiagramDamage[]>()
  for (const d of damages) {
    if (!d.panelCode || d.panelCode === 'other') continue
    map.set(d.panelCode, [...(map.get(d.panelCode) ?? []), d])
  }

  const activeDamages = active ? (map.get(active) ?? []) : []
  const affected = map.size

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-start">

      {/* ── SVG ─────────────────────────────────────────────── */}
      <div className="w-full sm:w-48 shrink-0">
        <svg viewBox="0 0 360 700" className="w-full h-auto">
          <defs>
            <clipPath id="car-clip">
              <path d={CAR_PATH} />
            </clipPath>
          </defs>

          {/* Base fill — undamaged panels */}
          <path d={CAR_PATH} fill="#e2e8f0" stroke="none" />

          {/* Colored damage fills — clipped to car shape */}
          <g clipPath="url(#car-clip)">
            {Array.from(map.entries()).map(([code, dmgs]) => {
              const r = PANEL_RECTS[code]
              if (!r) return null
              const w = worst(dmgs)
              return (
                <rect key={code}
                  x={r.x} y={r.y} width={r.w} height={r.h}
                  fill={FILL[w]}
                  opacity={active === code ? 1 : 0.85}
                />
              )
            })}
          </g>

          {/* Panel divider lines */}
          <g clipPath="url(#car-clip)" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="3 2">
            {DIVIDERS.map((d, i) => (
              <line key={i} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} />
            ))}
          </g>

          {/* Car outline on top */}
          <path d={CAR_PATH} fill="none" stroke="#64748b" strokeWidth="1.8" />

          {/* Clickable hit areas + damage badges */}
          {Object.entries(PANEL_RECTS).map(([code, r]) => {
            const dmgs   = map.get(code)
            const isHit  = active === code
            const hasDmg = !!dmgs
            const w = hasDmg ? worst(dmgs!) : 'minor'
            // Badge center: top-right of rect, clamped inside car
            const bx = Math.min(r.x + r.w - 10, 340)
            const by = Math.max(r.y + 10, 15)
            return (
              <g key={code}
                onClick={() => setActive(isHit ? null : code)}
                style={{ cursor: hasDmg ? 'pointer' : 'default' }}>
                {/* Invisible hit rect */}
                <rect x={r.x} y={r.y} width={r.w} height={r.h}
                  fill="transparent" clipPath="url(#car-clip)" />
                {/* Active outline */}
                {isHit && (
                  <rect x={r.x} y={r.y} width={r.w} height={r.h}
                    fill="none" stroke="#1e293b" strokeWidth="2"
                    strokeDasharray="4 2" clipPath="url(#car-clip)" />
                )}
                {/* Damage count badge */}
                {hasDmg && (
                  <>
                    <circle cx={bx} cy={by} r={9} fill={STROKE[w]} />
                    <text x={bx} y={by + 3.5} textAnchor="middle"
                      fontSize="8.5" fill="white" fontWeight="bold">
                      {dmgs!.length}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Direction labels */}
          <text x="180" y="11" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700" letterSpacing="1">FRONT</text>
          <text x="180" y="698" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700" letterSpacing="1">REAR</text>
        </svg>
      </div>

      {/* ── Info panel ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-3">

        {active ? (
          <div className="bg-white rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                {PANEL_LABELS[active] ?? active}
              </p>
              <button onClick={() => setActive(null)}
                className="text-xs text-slate-400 hover:text-slate-600 leading-none">✕</button>
            </div>
            {activeDamages.length === 0 ? (
              <p className="text-xs text-slate-400">No damage on this panel.</p>
            ) : (
              <div className="space-y-2.5">
                {activeDamages.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${DOT[d.severity?.toLowerCase() ?? 'minor'] ?? 'bg-slate-400'}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 capitalize">
                        {d.severity} {d.type?.replace(/_/g, ' ')}
                      </p>
                      {d.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
            <p className="text-xs font-semibold text-slate-600">
              {affected === 0 ? 'No damage detected' : `${affected} panel${affected !== 1 ? 's' : ''} with damage`}
            </p>
            {affected > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">Tap a coloured panel for details</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-3 flex-wrap">
          {(['severe','moderate','minor'] as const).map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${DOT[s]}`} />
              <span className="text-xs text-slate-500 capitalize">{s}</span>
            </div>
          ))}
        </div>

        {/* Affected panel list */}
        {affected > 0 && (
          <div className="space-y-0.5">
            {Array.from(map.entries()).map(([code, dmgs]) => {
              const w = worst(dmgs)
              return (
                <button key={code}
                  onClick={() => setActive(active === code ? null : code)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                    active === code ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[w]}`} />
                  <span className="flex-1 text-slate-700 font-medium">{PANEL_LABELS[code] ?? code}</span>
                  <span className="text-slate-400">{dmgs.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
