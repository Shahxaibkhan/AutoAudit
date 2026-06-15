import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatDate, inspectionTypeLabel, inspectionTypeBadge, inspectionPartyLabel, inspectionPeriodLabels, inspectionReportTitle, isSingleInspection } from '@/lib/utils'
import Image from 'next/image'
import DownloadReportButton from '@/components/DownloadReportButton'
import LightboxImage from '@/components/LightboxImage'

const PANEL_LABELS: Record<string, string> = {
  front_bumper: 'Front Bumper',
  hood: 'Hood',
  windshield: 'Windshield',
  roof: 'Roof',
  trunk_lid: 'Trunk / Boot',
  rear_bumper: 'Rear Bumper',
  rear_window: 'Rear Window',
  driver_door: 'Driver Door',
  passenger_door: 'Passenger Door',
  rear_driver_door: 'Rear Driver Door',
  rear_passenger_door: 'Rear Passenger Door',
  front_left_fender: 'Front Left Fender',
  front_right_fender: 'Front Right Fender',
  rear_left_quarter: 'Rear Left Quarter',
  rear_right_quarter: 'Rear Right Quarter',
  driver_mirror: 'Driver Mirror',
  passenger_mirror: 'Passenger Mirror',
  driver_rocker: 'Driver Sill',
  passenger_rocker: 'Passenger Sill',
  front_left_headlight: 'Front Left Headlight',
  front_right_headlight: 'Front Right Headlight',
  rear_left_taillight: 'Rear Left Taillight',
  rear_right_taillight: 'Rear Right Taillight',
  front_left_wheel: 'Front Left Wheel',
  front_right_wheel: 'Front Right Wheel',
  rear_left_wheel: 'Rear Left Wheel',
  rear_right_wheel: 'Rear Right Wheel',
  other: 'Other',
}

function gradeColor(grade: string): string {
  switch ((grade || '').toUpperCase()) {
    case 'A': return 'bg-emerald-500'
    case 'B': return 'bg-teal-500'
    case 'C': return 'bg-amber-500'
    case 'D': return 'bg-orange-500'
    default:  return 'bg-red-500'
  }
}

function severityStyle(severity: string): string {
  switch ((severity || '').toLowerCase()) {
    case 'severe':   return 'bg-red-100 text-red-700'
    case 'moderate': return 'bg-amber-100 text-amber-700'
    default:         return 'bg-slate-100 text-slate-600'
  }
}

function panelLabel(code: string): string {
  return PANEL_LABELS[code] || code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

type Damage = {
  id: string
  panelCode: string | null
  severity: string
  type: string
  description: string | null
  location: string | null
  imageUrl: string | null
  isNew: boolean
}

function groupByPanel(damages: Damage[]): Map<string, Damage[]> {
  const map = new Map<string, Damage[]>()
  for (const d of damages) {
    const key = d.panelCode || 'other'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  return map
}

function DamageCard({ d }: { d: Damage }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className={`mt-0.5 shrink-0 inline-block w-2 h-2 rounded-full ${
        d.severity?.toLowerCase() === 'severe'   ? 'bg-red-500' :
        d.severity?.toLowerCase() === 'moderate' ? 'bg-amber-400' :
        'bg-slate-400'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${severityStyle(d.severity)}`}>
            {d.severity}
          </span>
          <span className="text-xs text-slate-500 capitalize">{(d.type || '').replace(/_/g, ' ')}</span>
        </div>
        {d.description && (
          <p className="text-xs text-slate-600 mt-0.5">{d.description}</p>
        )}
      </div>
      {d.imageUrl && (
        <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-slate-100 relative">
          <LightboxImage src={d.imageUrl} alt={d.type} fill className="object-cover" sizes="80px" />
        </div>
      )}
    </div>
  )
}

function PanelGroup({ panelCode, damages, dividerClass }: { panelCode: string; damages: Damage[]; dividerClass: string }) {
  return (
    <div className="py-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {panelLabel(panelCode)}
      </p>
      <div className={`divide-y ${dividerClass}`}>
        {damages.map(d => <DamageCard key={d.id} d={d} />)}
      </div>
    </div>
  )
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id: string }).id

  const inspection = await prisma.inspection.findFirst({
    where: { id: params.id, userId },
    include: {
      vehicle: true,
      images: true,
      damages: { orderBy: { isNew: 'desc' } },
    },
  })
  const REPORT_STATUSES = ['COMPLETED', 'PENDING_CUSTOMER_REVIEW', 'LOCKED', 'DISPUTED']
  if (!inspection || !REPORT_STATUSES.includes(inspection.status)) notFound()

  const aiReport = inspection.aiReport ? JSON.parse(inspection.aiReport) : null
  const newDamages = inspection.damages.filter(d => d.isNew)
  const existingDamages = inspection.damages.filter(d => !d.isNew)
  const isComparison = !!inspection.preInspectionId
  const partyLabel = inspectionPartyLabel(inspection.type)
  const periodLabels = inspectionPeriodLabels(inspection.type)

  const newByPanel = groupByPanel(newDamages)
  const existingByPanel = groupByPanel(existingDamages)
  const isB2C = isSingleInspection(inspection.type)
  const reportTitle = isB2C ? inspectionReportTitle(inspection.type) : 'Inspection Report'
  const isLocked = inspection.status === 'LOCKED'
  const isDisputed = inspection.status === 'DISPUTED'
  const isPendingCustomer = inspection.status === 'PENDING_CUSTOMER_REVIEW'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/inspections/${params.id}`} className="text-slate-400 hover:text-slate-600 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">{reportTitle}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{formatDate(inspection.createdAt)}</p>
        </div>
        {inspection.tier !== 'QUICK' && <DownloadReportButton inspectionId={params.id} />}
      </div>

      <div id="report-content" className="space-y-4 sm:space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${inspectionTypeBadge(inspection.type)}`}>
                {inspectionTypeLabel(inspection.type)}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year}
              </h2>
              <p className="text-slate-500 text-sm">{inspection.vehicle.licensePlate} · {inspection.vehicle.color}</p>
            </div>

            {/* Grade circle + key */}
            {aiReport?.letterGrade && (
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${gradeColor(aiReport.letterGrade)}`}>
                  <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                    {aiReport.letterGrade.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Condition grade</p>
                {/* Grade key */}
                <div className="flex flex-col gap-0.5 text-right">
                  {[
                    { g: 'A', label: 'Excellent', color: 'text-emerald-600' },
                    { g: 'B', label: 'Good',      color: 'text-teal-600'    },
                    { g: 'C', label: 'Fair',       color: 'text-amber-600'   },
                    { g: 'D', label: 'Poor',       color: 'text-orange-600'  },
                    { g: 'F', label: 'Very poor',  color: 'text-red-600'     },
                  ].map(({ g, label, color }) => (
                    <div key={g} className={`flex items-center gap-1 text-xs ${
                      aiReport.letterGrade.toUpperCase() === g ? 'font-bold ' + color : 'text-slate-300'
                    }`}>
                      <span className="w-3 font-bold">{g}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quality metrics row */}
          {aiReport && (aiReport.framesAnalyzed != null || aiReport.qualityScore != null) && (
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              {aiReport.framesAnalyzed != null && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Frames analyzed</span>
                  <span className="text-xs font-bold text-slate-700">{aiReport.framesAnalyzed}</span>
                </div>
              )}
              {aiReport.qualityScore != null && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Quality score</span>
                  <span className="text-xs font-bold text-slate-700">{aiReport.qualityScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Renter / period info */}
          {(inspection.renterName || inspection.rentalStart) && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {inspection.renterName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{partyLabel}</p>
                  <p className="font-semibold text-slate-800">{inspection.renterName}</p>
                </div>
              )}
              {inspection.renterPhone && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                  <p className="font-semibold text-slate-800">{inspection.renterPhone}</p>
                </div>
              )}
              {inspection.rentalStart && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{periodLabels.start}</p>
                  <p className="font-semibold text-slate-800">{formatDate(inspection.rentalStart)}</p>
                </div>
              )}
              {inspection.rentalEnd && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{periodLabels.end}</p>
                  <p className="font-semibold text-slate-800">{formatDate(inspection.rentalEnd)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary banner */}
        {aiReport && (
          <div className={`rounded-2xl p-4 sm:p-5 border ${
            isComparison
              ? (newDamages.length > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200')
              : 'bg-teal-50 border-teal-200'
          }`}>
            <div className="flex items-start gap-3">
              {isComparison ? (
                newDamages.length > 0
                  ? <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  : <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {isComparison
                    ? (newDamages.length > 0
                        ? `${newDamages.length} new damage(s) detected`
                        : 'No new damage — vehicle returned in same condition')
                    : isB2C
                      ? (existingDamages.length === 0
                          ? 'No damage found — vehicle looks clean'
                          : `${existingDamages.length} issue${existingDamages.length !== 1 ? 's' : ''} found`)
                      : `${inspectionTypeLabel(inspection.type)} inspection complete`
                  }
                </p>
                <p className="text-sm text-slate-600 mt-1">{aiReport.summary}</p>
                {/* WhatsApp share for buyer inspection */}
                {inspection.type === 'BUYER_INSPECTION' && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Pre-purchase inspection report for ${inspection.vehicle.make} ${inspection.vehicle.model} ${inspection.vehicle.year} — ${inspection.vehicle.licensePlate}. Grade: ${aiReport.letterGrade ?? 'N/A'}. ${existingDamages.length} issue(s) found.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                    <span>📤</span> Share report via WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stale data warning — shown when damage count is suspiciously high */}
        {inspection.damages.length > 10 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {inspection.damages.length} damages found — this may include duplicates
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Improved AI filters are now available. Re-run the analysis to get a cleaner report with fewer false detections.
              </p>
              <a href={`/inspections/${params.id}/capture`}
                className="inline-block mt-2 text-xs font-semibold text-amber-800 underline underline-offset-2">
                Re-analyze this inspection →
              </a>
            </div>
          </div>
        )}

        {/* Verification status block */}
        {(isLocked || isDisputed || isPendingCustomer) && (
          <div className={`rounded-2xl p-4 sm:p-5 border ${
            isLocked ? 'bg-emerald-50 border-emerald-200' :
            isDisputed ? 'bg-red-50 border-red-200' :
            'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{isLocked ? '🔒' : isDisputed ? '⚠️' : '⏳'}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isLocked ? 'text-emerald-800' : isDisputed ? 'text-red-800' : 'text-amber-800'}`}>
                  {isLocked ? 'Fully Verified — Both Parties Signed'
                    : isDisputed ? 'Disputed — Some findings were contested'
                    : 'Awaiting Customer Review'}
                </p>
                <div className="mt-2 space-y-1 text-xs">
                  {inspection.ownerSignedAt && (
                    <p className="text-slate-600">
                      Owner signed: <strong>{new Date(inspection.ownerSignedAt).toLocaleString()}</strong>
                      {inspection.ownerPhone && ` · ***${inspection.ownerPhone.slice(-4)}`}
                    </p>
                  )}
                  {inspection.customerSignedAt && (
                    <p className="text-slate-600">
                      Customer signed: <strong>{new Date(inspection.customerSignedAt).toLocaleString()}</strong>
                      {inspection.customerPhone && ` · ***${inspection.customerPhone.slice(-4)}`}
                    </p>
                  )}
                </div>
                {inspection.verificationHash && (
                  <div className="mt-3 bg-slate-900 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">SHA-256 Verification Hash</p>
                    <p className="text-xs text-teal-400 font-mono break-all">{inspection.verificationHash}</p>
                  </div>
                )}
                {isPendingCustomer && inspection.shareToken && (
                  <div className="mt-3 flex items-center gap-2">
                    <a href={`/review/${inspection.shareToken}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-amber-700 font-semibold hover:underline">
                      View customer review page →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Damages — grouped by panel */}
        {isComparison && newDamages.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-200 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              New Damage ({newDamages.length})
            </h3>
            <div className="divide-y divide-red-100 space-y-0">
              {Array.from(newByPanel.entries()).map(([code, damages]) => (
                <PanelGroup key={code} panelCode={code} damages={damages} dividerClass="divide-red-50" />
              ))}
            </div>
          </div>
        )}

        {/* Existing / all damages — grouped by panel */}
        {existingDamages.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              {isComparison ? 'Pre-existing Damage' : 'Damage Found'} ({existingDamages.length})
            </h3>
            <div className="divide-y divide-slate-100 space-y-0">
              {Array.from(existingByPanel.entries()).map(([code, damages]) => (
                <PanelGroup key={code} panelCode={code} damages={damages} dividerClass="divide-slate-50" />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {aiReport?.recommendations?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Recommendations</h3>
            <ul className="space-y-2">
              {aiReport.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Photos */}
        {inspection.images.length > 0 && (() => {
          const gallery = inspection.images.map(img => ({ src: img.url, caption: img.angle }))
          return (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 text-sm sm:text-base">
                Inspection Photos ({inspection.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {inspection.images.map((img, i) => (
                  <div key={img.id}>
                    <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative">
                      <LightboxImage
                        src={img.url} alt={img.angle} fill sizes="200px"
                        className="object-cover"
                        caption={img.angle}
                        gallery={gallery}
                        galleryIndex={i}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-center capitalize">{img.angle.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
