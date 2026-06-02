import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, FileText, Car, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatDate, inspectionTypeLabel, inspectionTypeBadge, inspectionPartyLabel, inspectionPeriodLabels } from '@/lib/utils'
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
      <div className="flex items-start gap-3 mb-6">
        <Link href="/inspections" className="text-slate-400 hover:text-slate-600 transition-colors mt-1 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {inspection.vehicle.make} {inspection.vehicle.model}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${inspectionTypeBadge(inspection.type)}`}>
              {inspectionTypeLabel(inspection.type)}
            </span>
            <p className="text-slate-400 text-xs sm:text-sm">{formatDate(inspection.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && (
            <Link
              href={`/inspections/${params.id}/capture`}
              className="flex items-center gap-1.5 sm:gap-2 bg-teal-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{inspection.images.length > 0 ? 'Continue' : 'Start'}</span> Capture
            </Link>
          )}
          {isCompleted && (
            <Link
              href={`/inspections/${params.id}/report`}
              className="flex items-center gap-1.5 sm:gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Report
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

          {/* Damage list — grouped by panel */}
          {inspection.damages.length > 0 && (() => {
            const PANEL_LABELS: Record<string, string> = {
              front_bumper: 'Front Bumper', hood: 'Hood', windshield: 'Windshield',
              roof: 'Roof', trunk_lid: 'Trunk / Boot', rear_bumper: 'Rear Bumper',
              rear_window: 'Rear Window', driver_door: 'Driver Door',
              passenger_door: 'Passenger Door', rear_driver_door: 'Rear Driver Door',
              rear_passenger_door: 'Rear Passenger Door', front_left_fender: 'Front Left Fender',
              front_right_fender: 'Front Right Fender', rear_left_quarter: 'Rear Left Quarter',
              rear_right_quarter: 'Rear Right Quarter', driver_mirror: 'Driver Mirror',
              passenger_mirror: 'Passenger Mirror', driver_rocker: 'Driver Sill',
              passenger_rocker: 'Passenger Sill', other: 'Other',
            }
            const grouped = new Map<string, typeof inspection.damages>()
            for (const d of inspection.damages) {
              const key = d.panelCode || 'other'
              grouped.set(key, [...(grouped.get(key) ?? []), d])
            }
            return (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Damage Report ({inspection.damages.length})
                </h2>
                <div className="divide-y divide-slate-100">
                  {Array.from(grouped.entries()).map(([panelCode, damages]) => (
                    <div key={panelCode} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        {PANEL_LABELS[panelCode] || panelCode.replace(/_/g, ' ')}
                      </p>
                      <div className="space-y-2">
                        {damages.map(d => (
                          <div key={d.id} className="flex items-start gap-2.5">
                            <span className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                              d.severity?.toLowerCase() === 'severe' ? 'bg-red-500' :
                              d.severity?.toLowerCase() === 'moderate' ? 'bg-amber-400' : 'bg-slate-400'
                            }`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  d.severity?.toLowerCase() === 'severe' ? 'bg-red-100 text-red-700' :
                                  d.severity?.toLowerCase() === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>{d.severity}</span>
                                <span className="text-xs text-slate-500 capitalize">{d.type.replace(/_/g, ' ')}</span>
                                {d.isNew && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">NEW</span>}
                              </div>
                              {d.description && <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
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
