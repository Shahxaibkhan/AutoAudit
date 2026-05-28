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

  const users = await prisma.user.findMany({
    where: {
      // Exclude demo accounts from admin panel
      email: { not: { contains: '@autoauditai.com' } },
    },
    include: {
      _count: { select: { inspections: true, vehicles: true } },
      inspections: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      businessName: u.businessName,
      plan: u.plan,
      creditsUsed: u.creditsUsed,
      creditsTotal: u.creditsTotal,
      trialEndsAt: u.trialEndsAt?.toISOString() ?? null,
      subStatus: u.subStatus,
      createdAt: u.createdAt.toISOString(),
      lastActiveAt: u.inspections[0]?.createdAt.toISOString() ?? null,
      inspectionCount: u._count.inspections,
      vehicleCount: u._count.vehicles,
    }))
  )
}
