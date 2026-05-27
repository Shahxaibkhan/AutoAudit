import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatDate, formatCurrency, severityColor, conditionColor } from '@/lib/utils'
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
  const isComparison = inspection.type === 'POST_RENTAL' && inspection.preInspectionId

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/inspections/${params.id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Inspection Report</h1>
          <p className="text-gray-500 text-sm mt-0.5">{formatDate(inspection.createdAt)}</p>
        </div>
        <DownloadReportButton inspectionId={params.id} />
      </div>

      <div id="report-content" className="space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  inspection.type === 'PRE_RENTAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {inspection.type.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                {inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year}
              </h2>
              <p className="text-gray-500 text-sm">{inspection.vehicle.licensePlate} · {inspection.vehicle.color}</p>
            </div>
            {aiReport && (
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Overall Condition</p>
                <p className={`text-2xl font-bold capitalize ${conditionColor(aiReport.overallCondition)}`}>
                  {aiReport.overallCondition}
                </p>
              </div>
            )}
          </div>

          {(inspection.renterName || inspection.rentalStart) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {inspection.renterName && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Renter</p>
                  <p className="font-medium text-gray-800">{inspection.renterName}</p>
                </div>
              )}
              {inspection.renterPhone && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                  <p className="font-medium text-gray-800">{inspection.renterPhone}</p>
                </div>
              )}
              {inspection.rentalStart && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Rental Start</p>
                  <p className="font-medium text-gray-800">{formatDate(inspection.rentalStart)}</p>
                </div>
              )}
              {inspection.rentalEnd && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Rental End</p>
                  <p className="font-medium text-gray-800">{formatDate(inspection.rentalEnd)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {aiReport && (
          <div className={`rounded-xl p-5 border ${
            isComparison
              ? (newDamages.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {isComparison ? (
                newDamages.length > 0
                  ? <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  : <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {isComparison
                    ? (newDamages.length > 0 ? `${newDamages.length} new damage(s) detected after rental` : 'No new damage — car returned in same condition')
                    : 'Pre-rental inspection complete'
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">{aiReport.summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* New Damages (for post-rental) */}
        {isComparison && newDamages.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 p-5">
            <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              New Damage After Rental ({newDamages.length})
            </h3>
            <div className="space-y-3">
              {newDamages.map(d => (
                <div key={d.id} className="p-3.5 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(d.severity)}`}>{d.severity}</span>
                        <span className="text-xs text-gray-500 capitalize">{d.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{d.location}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{d.description}</p>
                    </div>
                    {d.estimatedCost && <span className="font-bold text-red-700">{formatCurrency(d.estimatedCost)}</span>}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-red-100">
                <span className="font-bold text-red-800">
                  Total new damage: {formatCurrency(newDamages.reduce((s, d) => s + (d.estimatedCost || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* All damages */}
        {existingDamages.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {isComparison ? 'Pre-existing Damage' : 'Damage Found'} ({existingDamages.length})
            </h3>
            <div className="space-y-3">
              {existingDamages.map(d => (
                <div key={d.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(d.severity)}`}>{d.severity}</span>
                        <span className="text-xs text-gray-500 capitalize">{d.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{d.location}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{d.description}</p>
                    </div>
                    {d.estimatedCost && <span className="font-semibold text-gray-700">{formatCurrency(d.estimatedCost)}</span>}
                  </div>
                </div>
              ))}
              {totalCost > 0 && (
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total: {formatCurrency(totalCost)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {aiReport?.recommendations?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {aiReport.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Photos */}
        {inspection.images.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Inspection Photos ({inspection.images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {inspection.images.map(img => (
                <div key={img.id}>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image src={img.url} alt={img.angle} fill className="object-cover" sizes="200px" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center capitalize">{img.angle.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
