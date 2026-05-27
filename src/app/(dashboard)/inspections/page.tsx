import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ClipboardList, Plus, Car } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id: string }).id

  const inspections = await prisma.inspection.findMany({
    where: { userId },
    include: { vehicle: true, damages: true, images: { take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inspections</h1>
          <p className="text-slate-400 text-sm mt-1">{inspections.length} total inspection{inspections.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/inspections/new" className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20">
          <Plus className="w-4 h-4" /> New Inspection
        </Link>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No inspections yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first inspection to start detecting damage.</p>
          <Link href="/inspections/new" className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20">
            <Plus className="w-4 h-4" /> Create inspection
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Damages</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inspections.map(insp => (
                <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <Link href={`/inspections/${insp.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Car className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{insp.vehicle.make} {insp.vehicle.model}</div>
                        <div className="text-xs text-slate-400">{insp.vehicle.licensePlate}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                      insp.type === 'PRE_RENTAL' ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {insp.type === 'PRE_RENTAL' ? 'Pre-rental' : 'Post-rental'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                      insp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      insp.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {insp.status === 'COMPLETED' ? 'Completed' : insp.status === 'IN_PROGRESS' ? 'In progress' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-900">{insp.damages.length}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-400">{formatDate(insp.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
