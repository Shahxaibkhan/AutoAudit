import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const inspection = await prisma.inspection.findFirst({
    where: {
      shareToken: params.token,
      shareTokenExpiresAt: { gt: new Date() },
    },
    include: {
      vehicle: true,
      damages: {
        where: { isVisibleInFinal: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!inspection) {
    return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 })
  }

  if (inspection.status === 'LOCKED' || inspection.status === 'DISPUTED') {
    return NextResponse.json({ error: 'This inspection has already been signed' }, { status: 410 })
  }

  const visible = inspection.damages.filter(d =>
    d.verificationState !== 'OWNER_REMOVED' && d.isVisibleInFinal
  )
  const severe   = visible.filter(d => d.severity === 'severe')
  const moderate = visible.filter(d => d.severity === 'moderate')
  const minor    = visible.filter(d => d.severity === 'minor')

  return NextResponse.json({
    inspection: {
      id: inspection.id,
      type: inspection.type,
      status: inspection.status,
      vehicle: {
        make: inspection.vehicle.make,
        model: inspection.vehicle.model,
        year: inspection.vehicle.year,
        licensePlate: inspection.vehicle.licensePlate,
        color: inspection.vehicle.color,
      },
      renterName: inspection.renterName,
      ownerSignedAt: inspection.ownerSignedAt,
      ownerPhone: inspection.ownerPhone
        ? `+92***${inspection.ownerPhone.slice(-4)}`
        : null,
    },
    damages: { severe, moderate, minor },
    summary: {
      total: visible.length,
      severe: severe.length,
      moderate: moderate.length,
      minor: minor.length,
    },
  })
}
