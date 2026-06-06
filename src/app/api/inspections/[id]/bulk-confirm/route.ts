import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const inspection = await prisma.inspection.findFirst({ where: { id: params.id, userId } })
  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (inspection.ownerSignedAt) return NextResponse.json({ error: 'Already signed' }, { status: 403 })

  const { severity, action } = await req.json() // action: 'confirm' | 'remove'

  if (!['confirm', 'remove'].includes(action)) {
    return NextResponse.json({ error: 'action must be confirm or remove' }, { status: 400 })
  }

  const result = await prisma.damage.updateMany({
    where: {
      inspectionId: params.id,
      severity,
      verificationState: 'AI_DETECTED', // only touch unreviewed ones
      isVisibleInFinal: true,
    },
    data: {
      verificationState: action === 'confirm' ? 'OWNER_CONFIRMED' : 'OWNER_REMOVED',
      isVisibleInFinal: action !== 'remove',
    },
  })

  return NextResponse.json({ updated: result.count })
}
