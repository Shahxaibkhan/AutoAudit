import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Owner adds a damage AAA missed
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const inspection = await prisma.inspection.findFirst({ where: { id: params.id, userId } })
  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (inspection.ownerSignedAt) return NextResponse.json({ error: 'Already signed' }, { status: 403 })

  const { type, severity, panelCode, location, description, imageUrl, note } = await req.json()

  if (!type || !severity || !description) {
    return NextResponse.json({ error: 'type, severity, description required' }, { status: 400 })
  }

  const damage = await prisma.damage.create({
    data: {
      inspectionId: params.id,
      type,
      severity,
      panelCode: panelCode || 'other',
      location: location || panelCode || 'unspecified',
      description,
      imageUrl: imageUrl || null,
      ownerNote: note || null,
      verificationState: 'OWNER_ADDED',
      isVisibleInFinal: true,
      confidence: 1.0,
      isNew: false,
    },
  })

  return NextResponse.json(damage, { status: 201 })
}
