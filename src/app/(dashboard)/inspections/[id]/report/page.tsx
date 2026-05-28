import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatDate, formatCurrency, severityColor, conditionColor, inspectionTypeLabel, inspectionTypeBadge, inspectionPartyLabel, inspectionPeriodLabels } from '@/lib/utils'
import Image from 'next/image'
import DownloadReportButton from '@/components/DownloadReportButton'

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
  if (!inspection || inspection.status !== 'COMPLETED') notFound()

  const aiReport = inspection.aiReport ? JSON.parse(inspection.aiReport) : null
  const newDamages = inspection.damages.filter(d => d.isNew)
  const existingDamages = inspection.damages.filter(d => !d.isNew)
  const totalCost = inspection.damages.reduce((s, d) => s + (d.estimatedCost || 0), 0)
  const isComparison = !!inspection.preInspectionId
  const partyLabel = inspectionPartyLabel(inspection.type)
  const periodLabels = inspectionPeriodLabels(inspection.type)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/inspections/${params.id}`} className="text-slate-400 hover:text-slate-600 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Inspection Report</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{formatDate(inspection.createdAt)}</p>
        </div>
        <DownloadReportButton inspectionId={params.id} />
      </div>

      <div id="report-content" className="space-y-4 sm:space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${inspectionTypeBadge(inspection.type)}`}>
                {inspectionTypeLabel(inspection.type)}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year}
              </h2>
              <p className="text-slate-500 text-sm">{inspection.vehicle.licensePlate} · {inspection.vehicle.color}</p>
            </div>
            {aiReport && (
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 mb-1">Condition</p>
                <p className={`text-xl sm:text-2xl font-bold capitalize ${conditionColor(aiReport.overallCondition)}`}>
                  {aiReport.overallCondition}
                </p>
              </div>
            )}
          </div>

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

        {/* Summary */}
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
                    ? (newDamages.length > 0 ? `${newDamages.length} new damage(s) detected` : 'No new damage — vehicle returned in same condition')
                    : `${inspectionTypeLabel(inspection.type)} inspection complete`
                  }
                </p>
                <p className="text-sm text-slate-600 mt-1">{aiReport.summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* New Damages */}
        {isComparison && newDamages.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-200 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              New Damage ({newDamages.length})
            </h3>
            <div className="space-y-3">
              {newDamages.map(d => (
                <div key={d.id} className="p-3 sm:p-3.5 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(d.severity)}`}>{d.severity}</span>
                        <span className="text-xs text-slate-500 capitalize">{d.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{d.location}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{d.description}</p>
                    </div>
                    {d.estimatedCost && <span className="font-bold text-red-700 shrink-0 text-sm">{formatCurrency(d.estimatedCost)}</span>}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-red-100">
                <span className="font-bold text-red-800 text-sm">
                  Total: {formatCurrency(newDamages.reduce((s, d) => s + (d.estimatedCost || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Existing/all damages */}
        {existingDamages.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              {isComparison ? 'Pre-existing Damage' : 'Damage Found'} ({existingDamages.length})
            </h3>
            <div className="space-y-3">
              {existingDamages.map(d => (
                <div key={d.id} className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(d.severity)}`}>{d.severity}</span>
                        <span className="text-xs text-slate-500 capitalize">{d.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{d.location}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{d.description}</p>
                    </div>
                    {d.estimatedCost && <span className="font-semibold text-slate-700 shrink-0 text-sm">{formatCurrency(d.estimatedCost)}</span>}
                  </div>
                </div>
              ))}
              {totalCost > 0 && (
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">Total: {formatCurrency(totalCost)}</span>
                </div>
              )}
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
        {inspection.images.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm sm:text-base">
              Inspection Photos ({inspection.images.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {inspection.images.map(img => (
                <div key={img.id}>
                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative">
                    <Image src={img.url} alt={img.angle} fill className="object-cover" sizes="200px" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-center capitalize">{img.angle.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
