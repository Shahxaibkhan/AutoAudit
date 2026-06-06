import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/subscription'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ban, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDate, inspectionTypeLabel, inspectionTypeBadge } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function fetchUserInspections(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/users/${id}/inspections`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function AdminUserPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminEmail(session.user.email)) notFound()

  const data = await fetchUserInspections(params.id)
  if (!data) notFound()

  const { user, inspections } = data

  const statusColor: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    PENDING: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {user.name ?? user.email}
          </h1>
          <p className="text-slate-400 text-sm">{user.email} · {user.plan}</p>
        </div>
        {user.isBlocked && (
          <span className="flex items-center gap-1.5 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold ml-auto">
            <Ban className="w-3.5 h-3.5" /> Blocked
          </span>
        )}
      </div>

      {/* User summary card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Business</p>
            <p className="font-semibold text-slate-800">{user.businessName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Plan</p>
            <p className="font-semibold text-slate-800">{user.plan}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Total inspections</p>
            <p className="font-semibold text-slate-800">{inspections.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Status</p>
            <p className={`font-semibold ${user.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
              {user.isBlocked ? 'Blocked' : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Inspections list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Inspections ({inspections.length})</h2>
        </div>
        {inspections.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No inspections yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {inspections.map((i: {
              id: string; type: string; status: string; vehicle: string
              licensePlate: string; imageCount: number; damageCount: number
              overallGrade: string | null; createdAt: string
            }) => (
              <div key={i.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${inspectionTypeBadge(i.type)}`}>
                      {inspectionTypeLabel(i.type)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[i.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {i.status.replace(/_/g, ' ')}
                    </span>
                    {i.overallGrade && (
                      <span className="text-xs font-bold text-slate-500">Grade: {i.overallGrade}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{i.vehicle} · {i.licensePlate}</p>
                  <p className="text-xs text-slate-400">
                    {i.imageCount} photos · {i.damageCount} damages · {formatDate(i.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {i.status === 'COMPLETED' ? (
                    <Link href={`/inspections/${i.id}/report`}
                      className="text-xs text-teal-600 font-semibold hover:underline">
                      Report →
                    </Link>
                  ) : (
                    <Link href={`/inspections/${i.id}`}
                      className="text-xs text-slate-500 font-semibold hover:underline">
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
