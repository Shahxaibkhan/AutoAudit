'use client'
import { useState } from 'react'

export interface DiagramDamage {
  panelCode: string | null
  severity: string
  type: string
  description: string | null
}

/* ── Panel definitions — top-down car, 400×720 viewBox ──────────────── */
const PANELS = [
  // ── Front ──────────────────────────────────────────────────────────
  { code: 'front_bumper',       label: 'Front Bumper',      x: 112, y: 12,  w: 176, h: 52,  rx: 22 },
  { code: 'hood',               label: 'Hood',              x: 95,  y: 64,  w: 210, h: 158, rx: 6  },
  { code: 'windshield',         label: 'Windshield',        x: 112, y: 222, w: 176, h: 54,  rx: 5  },
  // ── Cabin ──────────────────────────────────────────────────────────
  { code: 'roof',               label: 'Roof',              x: 95,  y: 276, w: 210, h: 178, rx: 6  },
  // ── Rear ───────────────────────────────────────────────────────────
  { code: 'rear_window',        label: 'Rear Window',       x: 112, y: 454, w: 176, h: 54,  rx: 5  },
  { code: 'trunk_lid',          label: 'Boot / Trunk',      x: 95,  y: 508, w: 210, h: 150, rx: 6  },
  { code: 'rear_bumper',        label: 'Rear Bumper',       x: 112, y: 658, w: 176, h: 50,  rx: 22 },
  // ── Driver side (left) ─────────────────────────────────────────────
  { code: 'front_left_fender',  label: 'FL Fender',         x: 44,  y: 64,  w: 56,  h: 158, rx: 6  },
  { code: 'driver_mirror',      label: 'Driver Mirror',     x: 27,  y: 214, w: 36,  h: 22,  rx: 5  },
  { code: 'driver_door',        label: 'Driver Door',       x: 35,  y: 276, w: 66,  h: 90,  rx: 5  },
  { code: 'rear_driver_door',   label: 'Rear Driver Door',  x: 35,  y: 366, w: 66,  h: 90,  rx: 5  },
  { code: 'rear_left_quarter',  label: 'RL Quarter',        x: 44,  y: 456, w: 56,  h: 202, rx: 6  },
  { code: 'driver_rocker',      label: 'Driver Sill',       x: 29,  y: 276, w: 14,  h: 180, rx: 4  },
  // ── Passenger side (right) ─────────────────────────────────────────
  { code: 'front_right_fender', label: 'FR Fender',         x: 300, y: 64,  w: 56,  h: 158, rx: 6  },
  { code: 'passenger_mirror',   label: 'Pass Mirror',       x: 337, y: 214, w: 36,  h: 22,  rx: 5  },
  { code: 'passenger_door',     label: 'Passenger Door',    x: 299, y: 276, w: 66,  h: 90,  rx: 5  },
  { code: 'rear_passenger_door',label: 'Rear Pass Door',    x: 299, y: 366, w: 66,  h: 90,  rx: 5  },
  { code: 'rear_right_quarter', label: 'RR Quarter',        x: 300, y: 456, w: 56,  h: 202, rx: 6  },
  { code: 'passenger_rocker',   label: 'Pass Sill',         x: 357, y: 276, w: 14,  h: 180, rx: 4  },
]

const SEVERITY_FILL:   Record<string, string> = { severe: '#fee2e2', moderate: '#fef3c7', minor: '#dcfce7' }
const SEVERITY_STROKE: Record<string, string> = { severe: '#ef4444', moderate: '#f59e0b', minor: '#22c55e' }
const SEVERITY_DOT:    Record<string, string> = { severe: 'bg-red-500', moderate: 'bg-amber-400', minor: 'bg-emerald-400' }

function worstSeverity(damages: DiagramDamage[]): string {
  if (damages.some(d => d.severity?.toLowerCase() === 'severe'))   return 'severe'
  if (damages.some(d => d.severity?.toLowerCase() === 'moderate')) return 'moderate'
  return 'minor'
}

export default function CarDiagram({ damages }: { damages: DiagramDamage[] }) {
  const [active, setActive] = useState<string | null>(null)

  // Group by panelCode, skip null / "other"
  const map = new Map<string, DiagramDamage[]>()
  for (const d of damages) {
    if (!d.panelCode || d.panelCode === 'other') continue
    map.set(d.panelCode, [...(map.get(d.panelCode) ?? []), d])
  }

  const activeDamages   = active ? map.get(active) ?? [] : []
  const activePanel     = PANELS.find(p => p.code === active)
  const affectedPanels  = map.size

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-start">

      {/* ── SVG diagram ─────────────────────────────────────── */}
      <div className="w-full sm:w-52 shrink-0">
        <svg viewBox="0 0 400 720" className="w-full h-auto drop-shadow-sm">
          <rect width="400" height="720" fill="#f8fafc" rx="12" />

          {/* Direction labels */}
          <text x="200" y="11" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">FRONT</text>
          <text x="200" y="716" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">REAR</text>
          <text x="12" y="365" textAnchor="middle" fontSize="10" fill="#94a3b8" transform="rotate(-90,12,365)">DRIVER</text>
          <text x="388" y="365" textAnchor="middle" fontSize="10" fill="#94a3b8" transform="rotate(90,388,365)">PASS.</text>

          {PANELS.map(panel => {
            const dmgs    = map.get(panel.code)
            const isActive  = active === panel.code
            const hasDmg  = !!dmgs
            const worst   = hasDmg ? worstSeverity(dmgs!) : 'minor'

            return (
              <g
                key={panel.code}
                onClick={() => setActive(isActive ? null : panel.code)}
                style={{ cursor: hasDmg ? 'pointer' : 'default' }}
              >
                <rect
                  x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={panel.rx}
                  fill={hasDmg ? SEVERITY_FILL[worst] : '#e2e8f0'}
                  stroke={hasDmg ? SEVERITY_STROKE[worst] : isActive ? '#94a3b8' : '#cbd5e1'}
                  strokeWidth={hasDmg ? (isActive ? 2.5 : 1.5) : 1}
                />
                {/* Count badge */}
                {hasDmg && (
                  <g>
                    <circle cx={panel.x + panel.w - 9} cy={panel.y + 9} r={9}
                      fill={SEVERITY_STROKE[worst]} />
                    <text x={panel.x + panel.w - 9} y={panel.y + 13}
                      textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                      {dmgs!.length}
                    </text>
                  </g>
                )}
                {/* Active highlight ring */}
                {isActive && (
                  <rect x={panel.x - 2} y={panel.y - 2} width={panel.w + 4} height={panel.h + 4}
                    rx={panel.rx + 2} fill="none" stroke="#0f172a" strokeWidth="2" strokeDasharray="4 2" />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── Side panel ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Active panel details */}
        {active && activePanel ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activePanel.label}</p>
              <button onClick={() => setActive(null)} className="text-xs text-slate-400 hover:text-slate-600">✕ Close</button>
            </div>
            {activeDamages.length === 0 ? (
              <p className="text-xs text-slate-400">No damage recorded for this panel.</p>
            ) : (
              <div className="space-y-2.5">
                {activeDamages.map((d, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[d.severity?.toLowerCase() ?? 'minor'] ?? 'bg-slate-400'}`} />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 capitalize">
                        {d.severity} {d.type?.replace(/_/g, ' ')}
                      </span>
                      {d.description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {affectedPanels === 0 ? 'No damage detected' : `${affectedPanels} panel${affectedPanels !== 1 ? 's' : ''} affected`}
            </p>
            {affectedPanels > 0 && (
              <p className="text-xs text-slate-400 mt-1">Tap a coloured panel to see damage details</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { label: 'Severe',   dot: 'bg-red-500'    },
            { label: 'Moderate', dot: 'bg-amber-400'  },
            { label: 'Minor',    dot: 'bg-emerald-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${item.dot}`} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Affected panel list */}
        {affectedPanels > 0 && (
          <div className="space-y-0.5">
            {Array.from(map.entries()).map(([code, dmgs]) => {
              const panel = PANELS.find(p => p.code === code)
              const worst = worstSeverity(dmgs)
              return (
                <button
                  key={code}
                  onClick={() => setActive(active === code ? null : code)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors text-xs ${
                    active === code ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[worst]}`} />
                  <span className="flex-1 text-slate-700 font-medium">{panel?.label ?? code}</span>
                  <span className="text-slate-400">{dmgs.length} issue{dmgs.length !== 1 ? 's' : ''}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
