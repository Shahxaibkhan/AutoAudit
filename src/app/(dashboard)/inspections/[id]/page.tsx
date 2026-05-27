import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, FileText, Car, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatDate, formatCurrency, severityColor, inspectionTypeLabel, inspectionTypeBadge, inspectionPartyLabel, inspectionPeriodLabels } from '@/lib/utils'
import Image from 'next/image'

export default async function InspectionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id: string }).id

  const inspection = await prisma.inspection.findFirst({
    where: { id: params.id, userId },
    include: {
      vehicle: true,
      images: { orderBy: { createdAt: 'asc' } },
      damages: { orderBy: { isNew: 'desc' } },
    },
  })
  if (!inspection) notFound()

  const isCompleted = inspection.status === 'COMPLETED'
  const partyLabel = inspectionPartyLabel(inspection.type)
  const periodLabels = inspectionPeriodLabels(inspection.type)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/inspections" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {inspection.vehicle.make} {inspection.vehicle.model}
            <span className={`ml-3 text-sm font-semibold px-2.5 py-1 rounded-lg align-middle ${inspectionTypeBadge(inspection.type)}`}>
              {inspectionTypeLabel(inspection.type)}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{formatDate(inspection.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isCompleted && (
            <Link
              href={`/inspections/${params.id}/capture`}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
            >
              <Camera className="w-4 h-4" />
              {inspection.images.length > 0 ? 'Continue Capture' : 'Start Capture'}
            </Link>
          )}
          {isCompleted && (
            <Link
              href={`/inspections/${params.id}/report`}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FileText className="w-4 h-4" />
              View Report
            </Link>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${
        isCompleted ? 'bg-emerald-50 border border-emerald-200' :
        inspection.status === 'IN_PROGRESS' ? 'bg-teal-50 border border-teal-200' :
        'bg-slate-50 border border-slate-200'
      }`}>
        {isCompleted
          ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          : <Camera className="w-5 h-5 text-teal-600 shrink-0" />}
        <div>
          <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-800' : inspection.status === 'IN_PROGRESS' ? 'text-teal-800' : 'text-slate-700'}`}>
            {isCompleted ? 'Inspection Complete' : `Status: ${inspection.status.replace('_', ' ')}`}
          </p>
          <p className={`text-xs mt-0.5 ${isCompleted ? 'text-emerald-600' : 'text-teal-600'}`}>
            {isCompleted
              ? `${inspection.damages.length} damage(s) found · ${inspection.images.length} photos taken`
              : 'Upload photos and run AI analysis to complete this inspection'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & party info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-400" /> Details
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Vehicle</p>
                <p className="font-semibold text-slate-800">{inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">License Plate</p>
                <p className="font-semibold text-slate-800">{inspection.vehicle.licensePlate}</p>
              </div>
              {inspection.renterName && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{partyLabel}</p>
                  <p className="font-semibold text-slate-800">{inspection.renterName}</p>
                </div>
              )}
              {inspection.renterPhone && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="font-semibold text-slate-800">{inspection.renterPhone}</p>
                </div>
              )}
              {inspection.rentalStart && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{periodLabels.start}</p>
                  <p className="font-semibold text-slate-800">{formatDate(inspection.rentalStart)}</p>
                </div>
              )}
              {inspection.rentalEnd && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{periodLabels.end}</p>
                  <p className="font-semibold text-slate-800">{formatDate(inspection.rentalEnd)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Damage list */}
          {inspection.damages.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Damage Report ({inspection.damages.length})
              </h2>
              <div className="space-y-3">
                {inspection.damages.map(d => (
                  <div key={d.id} className={`p-3.5 rounded-xl border ${d.isNew ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(d.severity)}`}>
                            {d.severity}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">{d.type.replace('_', ' ')}</span>
                          {d.isNew && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">NEW</span>}
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{d.location}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
                      </div>
                      {d.estimatedCost && (
                        <span className="text-sm font-bold text-slate-900 shrink-0">{formatCurrency(d.estimatedCost)}</span>
                      )}
                    </div>
                  </div>
                ))}
                {inspection.damages.some(d => d.estimatedCost) && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">
                      Total: {formatCurrency(inspection.damages.reduce((s, d) => s + (d.estimatedCost || 0), 0))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Photos column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-400" />
              Photos ({inspection.images.length})
            </h2>
            {inspection.images.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No photos yet</p>
                <Link href={`/inspections/${params.id}/capture`} className="mt-2 inline-block text-xs text-teal-600 hover:underline">
                  Start capturing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {inspection.images.map(img => (
                  <div key={img.id} className="relative">
                    <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
                      <Image src={img.url} alt={img.angle} fill className="object-cover" sizes="150px" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-center capitalize">{img.angle.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
