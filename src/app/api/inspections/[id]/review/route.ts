import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const inspection = await prisma.inspection.findFirst({
    where: { id: params.id, userId },
    include: {
      vehicle: true,
      damages: { orderBy: { createdAt: 'asc' } },
      images: { take: 1 },
    },
  })
  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Group damages by severity, pre-filtering removed ones
  const visible = inspection.damages.filter(d => d.isVisibleInFinal)
  const severe   = visible.filter(d => d.severity === 'severe')
  const moderate = visible.filter(d => d.severity === 'moderate')
  const minor    = visible.filter(d => d.severity === 'minor')

  return NextResponse.json({
    inspection: {
      id: inspection.id,
      type: inspection.type,
      status: inspection.status,
      vehicle: inspection.vehicle,
      aiReport: inspection.aiReport ? JSON.parse(inspection.aiReport) : null,
      ownerSignedAt: inspection.ownerSignedAt,
      customerSignedAt: inspection.customerSignedAt,
      shareToken: inspection.shareToken,
      verificationHash: inspection.verificationHash,
      lockedAt: inspection.lockedAt,
    },
    damages: { severe, moderate, minor },
    summary: {
      total: visible.length,
      severe: severe.length,
      moderate: moderate.length,
      minor: minor.length,
      confirmed: visible.filter(d => d.verificationState !== 'AI_DETECTED').length,
    },
  })
}
