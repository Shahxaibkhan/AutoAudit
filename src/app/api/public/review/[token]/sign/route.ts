import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const inspection = await prisma.inspection.findFirst({
    where: { shareToken: params.token, shareTokenExpiresAt: { gt: new Date() } },
    include: {
      vehicle: true,
      damages: { where: { isVisibleInFinal: true } },
    },
  })
  if (!inspection) return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 })
  if (inspection.customerSignedAt) return NextResponse.json({ error: 'Already signed' }, { status: 400 })

  const { phone, email } = await req.json()

  // Auto-confirm any remaining unreviewed damages
  await prisma.damage.updateMany({
    where: {
      inspectionId: inspection.id,
      isVisibleInFinal: true,
      verificationState: { in: ['AI_DETECTED', 'OWNER_CONFIRMED', 'OWNER_EDITED', 'OWNER_ADDED'] },
    },
    data: { verificationState: 'CUSTOMER_CONFIRMED' },
  })

  // Determine final status
  const hasDisputes = inspection.damages.some(d => d.verificationState === 'CUSTOMER_DISPUTED')
  const finalStatus = hasDisputes ? 'DISPUTED' : 'LOCKED'

  // Generate SHA-256 verification hash
  const now = new Date()
  const hashData = {
    inspection_id: inspection.id,
    vehicle: `${inspection.vehicle.make} ${inspection.vehicle.model} ${inspection.vehicle.year} ${inspection.vehicle.licensePlate}`,
    inspection_type: inspection.type,
    owner_signed_at: inspection.ownerSignedAt?.toISOString() ?? '',
    owner_phone_last4: inspection.ownerPhone?.slice(-4) ?? '',
    customer_signed_at: now.toISOString(),
    customer_phone_last4: phone?.slice(-4) ?? '',
    damages: inspection.damages
      .filter(d => d.isVisibleInFinal)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(d => ({ id: d.id, severity: d.severity, panel: d.panelCode, state: d.verificationState })),
  }
  const verificationHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(hashData, Object.keys(hashData).sort()))
    .digest('hex')

  await prisma.inspection.update({
    where: { id: inspection.id },
    data: {
      customerSignedAt: now,
      customerPhone: phone || null,
      customerEmail: email || null,
      status: finalStatus,
      verificationHash,
      hashGeneratedAt: now,
      lockedAt: finalStatus === 'LOCKED' ? now : null,
      disputeCount: hasDisputes
        ? inspection.damages.filter(d => d.verificationState === 'CUSTOMER_DISPUTED').length
        : 0,
    },
  })

  return NextResponse.json({
    status: finalStatus,
    verificationHash,
    hasDisputes,
    disputeCount: hasDisputes
      ? inspection.damages.filter(d => d.verificationState === 'CUSTOMER_DISPUTED').length
      : 0,
  })
}
