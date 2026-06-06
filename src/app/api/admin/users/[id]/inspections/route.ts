import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, businessName: true, plan: true, isBlocked: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const inspections = await prisma.inspection.findMany({
    where: { userId: params.id },
    include: {
      vehicle: { select: { make: true, model: true, year: true, licensePlate: true } },
      _count: { select: { images: true, damages: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    user,
    inspections: inspections.map(i => ({
      id: i.id,
      type: i.type,
      status: i.status,
      vehicle: `${i.vehicle.make} ${i.vehicle.model} ${i.vehicle.year}`,
      licensePlate: i.vehicle.licensePlate,
      imageCount: i._count.images,
      damageCount: i._count.damages,
      overallGrade: i.overallGrade,
      createdAt: i.createdAt.toISOString(),
    })),
  })
}
