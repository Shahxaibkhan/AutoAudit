import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: { token: string; damageId: string } }
) {
  const inspection = await prisma.inspection.findFirst({
    where: { shareToken: params.token, shareTokenExpiresAt: { gt: new Date() } },
  })
  if (!inspection) return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 })
  if (inspection.customerSignedAt) return NextResponse.json({ error: 'Already signed' }, { status: 403 })

  const damage = await prisma.damage.findFirst({
    where: { id: params.damageId, inspectionId: inspection.id },
  })
  if (!damage) return NextResponse.json({ error: 'Damage not found' }, { status: 404 })

  const { action, note } = await req.json()

  let verificationState: string
  switch (action) {
    case 'agree':    verificationState = 'CUSTOMER_CONFIRMED'; break
    case 'dispute':  verificationState = 'CUSTOMER_DISPUTED';  break
    default: return NextResponse.json({ error: 'action must be agree or dispute' }, { status: 400 })
  }

  const updated = await prisma.damage.update({
    where: { id: params.damageId },
    data: { verificationState, customerNote: note || null },
  })

  return NextResponse.json(updated)
}
