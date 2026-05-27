import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Car, ClipboardList, AlertTriangle, CheckCircle, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import DemoButton from '@/components/DemoButton'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id: string }).id

  const [vehicleCount, totalInspections, completedInspections, recentInspections] = await Promise.all([
    prisma.vehicle.count({ where: { ownerId: userId } }),
    prisma.inspection.count({ where: { userId } }),
    prisma.inspection.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.inspection.findMany({
      where: { userId },
      include: { vehicle: true, damages: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  const damagesFound = await prisma.damage.count({
    where: { inspection: { userId }, isNew: true },
  })

  const hasDemoData = await prisma.vehicle.count({
    where: { ownerId: userId, licensePlate: { startsWith: 'DEMO-' } },
  }).then(c => c > 0)

  const stats = [
    { label: 'Fleet Vehicles', value: vehicleCount, icon: Car, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20', change: null },
    { label: 'Total Inspections', value: totalInspections, icon: ClipboardList, gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20', change: null },
    { label: 'Completed', value: completedInspections, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', change: null },
    { label: 'New Damages', value: damagesFound, icon: AlertTriangle, gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20', change: null },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Good to see you, <span className="font-semibold text-gray-600">{session?.user?.name?.split(' ')[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <DemoButton hasData={hasDemoData} />
          <Link href="/inspections/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-px">
            <Plus className="w-4 h-4" />
            New Inspection
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, gradient, shadow }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg ${shadow}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-200" />
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
            <div className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent inspections */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div>
            <h2 className="font-black text-gray-900 tracking-tight">Recent Inspections</h2>
            <p className="text-xs text-gray-400 mt-0.5">{totalInspections} total</p>
          </div>
          <Link href="/inspections" className="inline-flex items-center gap-1 text-sm text-blue-600 font-semibold hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInspections.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No inspections yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Click <strong>Try Demo</strong> above to see how it works, or create your first real inspection.
            </p>
            <div className="flex items-center justify-center gap-3">
              <DemoButton hasData={false} />
              <Link href="/inspections/new"
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25">
                <Plus className="w-3.5 h-3.5" /> New inspection
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {recentInspections.map((insp, i) => {
              const newDmg = insp.damages.filter(d => d.isNew).length
              const isLast = i === recentInspections.length - 1
              return (
                <Link key={insp.id} href={`/inspections/${insp.id}`}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group ${!isLast ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full shrink-0 ${insp.type === 'PRE_RENTAL' ? 'bg-blue-200' : 'bg-violet-200'}`} />
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                      <Car className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        {insp.vehicle.make} {insp.vehicle.model}
                        <span className="font-normal text-gray-400 ml-2 text-xs">{insp.vehicle.year}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{insp.vehicle.licensePlate} · {formatDate(insp.createdAt)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                      insp.type === 'PRE_RENTAL' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                    }`}>
                      {insp.type === 'PRE_RENTAL' ? 'Pre-rental' : 'Post-rental'}
                    </span>
                    {newDmg > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg font-semibold">
                        {newDmg} new
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                      insp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      insp.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {insp.status === 'COMPLETED' ? 'Completed' : insp.status === 'IN_PROGRESS' ? 'In progress' : 'Pending'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/vehicles/new', icon: Car, label: 'Add a vehicle', desc: 'Register a new car to your fleet', color: 'blue' },
          { href: '/inspections/new', icon: ClipboardList, label: 'New inspection', desc: 'Start a pre or post-rental check', color: 'violet' },
          { href: '/inspections', icon: CheckCircle, label: 'View all reports', desc: 'Browse inspection history', color: 'emerald' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href}
            className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
            <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
              <Icon className={`w-5 h-5 text-${color}-500`} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  )
}
