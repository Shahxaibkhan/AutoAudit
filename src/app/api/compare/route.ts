import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compareInspections } from '@/lib/ai-provider'
import { canAnalyze } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id

  // Credit / subscription check
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const check = canAnalyze(user)
  if (!check.allowed) {
    return NextResponse.json({ error: 'limit_reached', reason: check.reason }, { status: 402 })
  }

  const { postInspectionId } = await req.json()

  const postInspection = await prisma.inspection.findFirst({
    where: { id: postInspectionId, userId },
    include: { images: true, damages: true },
  })
  if (!postInspection) return NextResponse.json({ error: 'Post-rental inspection not found' }, { status: 404 })
  if (!postInspection.preInspectionId) return NextResponse.json({ error: 'No pre-rental inspection linked' }, { status: 400 })

  const preInspection = await prisma.inspection.findFirst({
    where: { id: postInspection.preInspectionId, userId },
    include: { damages: true },
  })
  if (!preInspection) return NextResponse.json({ error: 'Pre-rental inspection not found' }, { status: 404 })

  const preDamages = preInspection.damages.map(d => ({
    type: d.type as 'scratch' | 'dent' | 'crack' | 'paint_chip' | 'broken' | 'missing' | 'other',
    severity: d.severity as 'minor' | 'moderate' | 'severe',
    location: d.location,
    description: d.description,
    estimatedCost: d.estimatedCost ?? undefined,
  }))

  await prisma.inspection.update({ where: { id: postInspectionId }, data: { status: 'IN_PROGRESS' } })

  const allNewDamages: Array<{
    type: string; severity: string; location: string; description: string; estimatedCost?: number; isNew: boolean
  }> = []
  let totalNewCost = 0

  for (const image of postInspection.images) {
    try {
      const imgRes = await fetch(image.url)
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      const base64 = buffer.toString('base64')
      const ext = image.url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpeg'
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

      const result = await compareInspections(base64, preDamages, mimeType)
      for (const dmg of result.newDamages) {
        allNewDamages.push({ ...dmg, isNew: true })
        totalNewCost += dmg.estimatedCost || 0
      }
    } catch (err) {
      console.error(`Failed to compare image ${image.id}:`, err)
    }
  }

  const comparisonReport = {
    newDamages: allNewDamages,
    existingDamages: preDamages,
    summary: allNewDamages.length > 0
      ? `${allNewDamages.length} new damage(s) detected. Estimated repair cost: $${totalNewCost.toFixed(2)}.`
      : 'No new damage detected. Vehicle returned in same condition.',
    hasNewDamage: allNewDamages.length > 0,
    totalNewDamageCost: totalNewCost,
  }

  await prisma.$transaction([
    prisma.damage.deleteMany({ where: { inspectionId: postInspectionId } }),
    ...allNewDamages.map(d =>
      prisma.damage.create({
        data: { inspectionId: postInspectionId, type: d.type, severity: d.severity, location: d.location, description: d.description, estimatedCost: d.estimatedCost, isNew: true },
      })
    ),
    ...preDamages.map(d =>
      prisma.damage.create({
        data: { inspectionId: postInspectionId, type: d.type, severity: d.severity, location: d.location, description: d.description, estimatedCost: d.estimatedCost, isNew: false },
      })
    ),
    prisma.inspection.update({ where: { id: postInspectionId }, data: { status: 'COMPLETED', aiReport: JSON.stringify(comparisonReport) } }),
    // Consume one credit
    prisma.user.update({ where: { id: userId }, data: { creditsUsed: { increment: 1 } } }),
  ])

  return NextResponse.json(comparisonReport)
}
