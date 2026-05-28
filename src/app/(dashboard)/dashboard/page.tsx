import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Car, ClipboardList, AlertTriangle, CheckCircle, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import DemoButton from '@/components/DemoButton'
import { formatDate, inspectionTypeLabel, inspectionTypeBadge, inspectionTypeBarColor } from '@/lib/utils'

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
    { label: 'Fleet Vehicles', value: vehicleCount, icon: Car, gradient: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-500/20' },
    { label: 'Total Inspections', value: totalInspections, icon: ClipboardList, gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    { label: 'Completed', value: completedInspections, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { label: 'New Damages', value: damagesFound, icon: AlertTriangle, gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Good to see you, <span className="font-semibold text-slate-600">{session?.user?.name?.split(' ')[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DemoButton hasData={hasDemoData} />
          <Link href="/inspections/new"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-teal-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20">
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New </span>Inspection
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, gradient, shadow }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg ${shadow}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-200" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent inspections */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div>
            <h2 className="font-black text-slate-900 tracking-tight">Recent Inspections</h2>
            <p className="text-xs text-slate-400 mt-0.5">{totalInspections} total</p>
          </div>
          <Link href="/inspections" className="inline-flex items-center gap-1 text-sm text-teal-600 font-semibold hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInspections.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">No inspections yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              Click <strong>Try Demo</strong> above to see how it works, or create your first real inspection.
            </p>
            <div className="flex items-center justify-center gap-3">
              <DemoButton hasData={false} />
              <Link href="/inspections/new"
                className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20">
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
                  className={`flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-slate-50/80 transition-colors group ${!isLast ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`w-1.5 sm:w-2 h-8 sm:h-10 rounded-full shrink-0 ${inspectionTypeBarColor(insp.type)}`} />
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors shrink-0">
                      <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {insp.vehicle.make} {insp.vehicle.model}
                        <span className="font-normal text-slate-400 ml-1.5 text-xs">{insp.vehicle.year}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-1 items-center">
                        <span>{insp.vehicle.licensePlate}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">{formatDate(insp.createdAt)}</span>
                        <span className={`sm:hidden text-xs px-1.5 py-0.5 rounded-md font-semibold ${inspectionTypeBadge(insp.type)}`}>
                          {inspectionTypeLabel(insp.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
                    <span className={`hidden sm:inline text-xs px-2.5 py-1 rounded-lg font-semibold ${inspectionTypeBadge(insp.type)}`}>
                      {inspectionTypeLabel(insp.type)}
                    </span>
                    {newDmg > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-lg font-semibold">
                        {newDmg} new
                      </span>
                    )}
                    <span className={`text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-semibold ${
                      insp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      insp.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {insp.status === 'COMPLETED' ? 'Done' : insp.status === 'IN_PROGRESS' ? 'In prog' : 'Pending'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-teal-400 transition-colors" />
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
          { href: '/vehicles/new', icon: Car, label: 'Add a vehicle', desc: 'Register a new car to your fleet', color: 'teal' },
          { href: '/inspections/new', icon: ClipboardList, label: 'New inspection', desc: 'Start a pre or post-rental check', color: 'indigo' },
          { href: '/inspections', icon: CheckCircle, label: 'View all reports', desc: 'Browse inspection history', color: 'emerald' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href}
            className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
            <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
              <Icon className={`w-5 h-5 text-${color}-500`} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  )
}
