import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

  const failed = await prisma.inspection.findMany({
    where: {
      OR: [
        // Stuck in IN_PROGRESS for > 30 min (pipeline hung or crashed)
        { status: 'IN_PROGRESS', updatedAt: { lt: thirtyMinutesAgo } },
        // PENDING with images uploaded but never analyzed
        { status: 'PENDING', images: { some: {} }, updatedAt: { lt: thirtyMinutesAgo } },
      ],
    },
    include: {
      vehicle: { select: { make: true, model: true, year: true, licensePlate: true } },
      user: { select: { name: true, email: true } },
      _count: { select: { images: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(
    failed.map(i => ({
      id: i.id,
      status: i.status,
      type: i.type,
      imageCount: i._count.images,
      vehicle: `${i.vehicle.make} ${i.vehicle.model} ${i.vehicle.year}`,
      licensePlate: i.vehicle.licensePlate,
      userName: i.user.name,
      userEmail: i.user.email,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
      stuckFor: Math.round((Date.now() - i.updatedAt.getTime()) / 60000), // minutes
    }))
  )
}
