import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import DownloadReportButton from '@/components/DownloadReportButton'

const SAMPLE = {
  vehicle: { make: 'Toyota', model: 'Corolla', year: 2021, licensePlate: 'LHR-ABC-123', color: 'White' },
  type: 'BUYER_INSPECTION',
  createdAt: '2026-06-01T10:30:00Z',
  grade: 'B',
  score: 78,
  framesAnalyzed: 32,
  qualityScore: 84,
  summary: 'The vehicle is in generally good condition with minor cosmetic damage. Two scratches and a small dent were detected. No structural damage or accident indicators found. Safe for purchase with negotiation on repair costs.',
  damages: [
    { panel: 'Driver Door', severity: 'moderate', type: 'Scratch', description: 'Two parallel scratches on the lower driver door edge, approximately 15cm each. Paint removed exposing primer. Likely from a car park incident.' },
    { panel: 'Rear Bumper', severity: 'minor', type: 'Scratch', description: 'Light scuff marks on the lower rear bumper, surface level only. Common parking wear.' },
    { panel: 'Front Left Wheel', severity: 'minor', type: 'Rim Damage', description: 'Light curb rash on the front left alloy rim. Superficial scraping on the outer lip of the wheel.' },
  ],
  recommendations: [
    'Driver door scratch: professional respray estimated at PKR 8,000–12,000',
    'Bumper scuffs: touch-up paint fix, PKR 2,000–4,000',
    'Rim curb rash: alloy repair service, PKR 3,000–5,000',
    'Negotiate PKR 15,000–20,000 off the asking price based on findings',
    'Request a mechanical inspection before finalising purchase',
  ],
}

function gradeColor(g: string) {
  const m: Record<string, string> = { A: 'bg-emerald-500', B: 'bg-teal-500', C: 'bg-amber-500', D: 'bg-orange-500' }
  return m[g] ?? 'bg-red-500'
}

function severityStyle(s: string) {
  if (s === 'severe') return 'bg-red-100 text-red-700'
  if (s === 'moderate') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <div className="text-xs text-slate-400 font-medium">Sample Inspection Report</div>
        <DownloadReportButton inspectionId="sample" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div id="report-content" className="space-y-4">

          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-blue-50 text-blue-700">
                  Pre-Purchase Vehicle Report
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {SAMPLE.vehicle.make} {SAMPLE.vehicle.model} {SAMPLE.vehicle.year}
                </h2>
                <p className="text-slate-500 text-sm">{SAMPLE.vehicle.licensePlate} · {SAMPLE.vehicle.color}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>Frames analyzed: <strong className="text-slate-700">{SAMPLE.framesAnalyzed}</strong></span>
                  <span>Quality score: <strong className="text-slate-700">{SAMPLE.qualityScore}</strong></span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${gradeColor(SAMPLE.grade)}`}>
                  <span className="text-3xl font-black text-white">{SAMPLE.grade}</span>
                </div>
                <p className="text-xs text-slate-400">Condition grade</p>
                <div className="text-right space-y-0.5">
                  {[{g:'A',l:'Excellent'},{g:'B',l:'Good'},{g:'C',l:'Fair'},{g:'D',l:'Poor'},{g:'F',l:'Very poor'}].map(({g,l})=>(
                    <div key={g} className={`flex items-center gap-1 text-xs ${SAMPLE.grade===g?'font-bold text-teal-600':'text-slate-300'}`}>
                      <span className="w-3 font-bold">{g}</span><span>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 text-sm">Pre-purchase inspection complete</p>
                <p className="text-sm text-slate-600 mt-1">{SAMPLE.summary}</p>
                <a href="https://wa.me/923434994409" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                  📤 Share via WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Damages */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Damage Found ({SAMPLE.damages.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {SAMPLE.damages.map((d, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{d.panel}</p>
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${d.severity==='severe'?'bg-red-500':d.severity==='moderate'?'bg-amber-400':'bg-slate-400'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityStyle(d.severity)}`}>{d.severity}</span>
                        <span className="text-xs text-slate-500">{d.type}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{d.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Recommendations for Buyer</h3>
            <ul className="space-y-2">
              {SAMPLE.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 pb-4">
            This is a sample report generated by AutoAuditAI · autoauditai.com<br />
            AI inspection is a screening tool and does not replace a physical inspection by a qualified mechanic.
          </p>
        </div>
      </div>
    </div>
  )
}
