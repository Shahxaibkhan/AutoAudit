import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; damageId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const inspection = await prisma.inspection.findFirst({
    where: { id: params.id, userId },
  })
  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (inspection.ownerSignedAt) return NextResponse.json({ error: 'Inspection already signed' }, { status: 403 })

  const damage = await prisma.damage.findFirst({
    where: { id: params.damageId, inspectionId: params.id },
  })
  if (!damage) return NextResponse.json({ error: 'Damage not found' }, { status: 404 })

  const { action, description, severity, note } = await req.json()

  let updateData: Record<string, unknown> = { ownerNote: note ?? damage.ownerNote }

  switch (action) {
    case 'confirm':
      updateData.verificationState = 'OWNER_CONFIRMED'
      break

    case 'edit':
      // Preserve original AI values before first edit
      updateData.verificationState = 'OWNER_EDITED'
      updateData.editedByOwner = true
      if (description) {
        updateData.originalDescription = damage.originalDescription ?? damage.description
        updateData.description = description
      }
      if (severity) {
        updateData.originalSeverity = damage.originalSeverity ?? damage.severity
        updateData.severity = severity
      }
      break

    case 'remove':
      updateData.verificationState = 'OWNER_REMOVED'
      updateData.isVisibleInFinal = false
      break

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const updated = await prisma.damage.update({
    where: { id: params.damageId },
    data: updateData,
  })

  return NextResponse.json(updated)
}
