import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Car, Plus, ClipboardList } from 'lucide-react'

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id: string }).id

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: userId },
    include: { _count: { select: { inspections: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500 text-sm mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in your fleet</p>
        </div>
        <Link href="/vehicles/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first vehicle to start creating inspections.</p>
          <Link href="/vehicles/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add your first vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <Link key={v.id} href={`/vehicles/${v.id}`} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{v.year}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{v.make} {v.model}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{v.licensePlate}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: v.color.toLowerCase() }} />
                <span className="text-xs text-gray-500 capitalize">{v.color}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-100">
                <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{v._count.inspections} inspection{v._count.inspections !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
