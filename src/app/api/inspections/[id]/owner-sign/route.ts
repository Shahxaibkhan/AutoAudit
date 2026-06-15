import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { SINGLE_INSPECTION_TYPES } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const inspection = await prisma.inspection.findFirst({
    where: { id: params.id, userId },
    include: { damages: true },
  })
  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (inspection.ownerSignedAt) return NextResponse.json({ error: 'Already signed' }, { status: 400 })

  const { phone } = await req.json()

  // Auto-confirm any remaining AI_DETECTED damages before signing
  await prisma.damage.updateMany({
    where: { inspectionId: params.id, verificationState: 'AI_DETECTED', isVisibleInFinal: true },
    data: { verificationState: 'OWNER_CONFIRMED' },
  })

  const isSingleParty = SINGLE_INSPECTION_TYPES.includes(inspection.type)

  if (isSingleParty) {
    // B2C: complete directly, no customer review needed
    await prisma.inspection.update({
      where: { id: params.id },
      data: {
        ownerSignedAt: new Date(),
        ownerPhone: phone || null,
        status: 'COMPLETED',
      },
    })
    return NextResponse.json({ completed: true })
  }

  // B2B: generate share token for customer review
  const shareToken = crypto.randomUUID()
  const shareTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.inspection.update({
    where: { id: params.id },
    data: {
      ownerSignedAt: new Date(),
      ownerPhone: phone || null,
      shareToken,
      shareTokenExpiresAt,
      status: 'PENDING_CUSTOMER_REVIEW',
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const shareUrl = `${baseUrl}/review/${shareToken}`

  return NextResponse.json({ shareToken, shareUrl })
}
