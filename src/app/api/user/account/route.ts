import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id

  // Delete user and all cascading data (inspections, vehicles, damages, images, sessions, accounts)
  // Prisma onDelete: Cascade handles the cascade automatically
  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ ok: true })
}
