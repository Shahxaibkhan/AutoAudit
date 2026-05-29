import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAnalyze } from '@/lib/subscription'
import { runInspectionPipeline } from '@/lib/pipeline'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Vercel Pro: allow up to 5 minutes for pipeline

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { inspectionId } = await req.json()
  if (!inspectionId) return NextResponse.json({ error: 'inspectionId required' }, { status: 400 })

  // Credit check
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const check = canAnalyze(user)
  if (!check.allowed) {
    return NextResponse.json({ error: 'limit_reached', reason: check.reason }, { status: 402 })
  }

  const inspection = await prisma.inspection.findFirst({
    where: { id: inspectionId, userId },
    include: { images: true, vehicle: true },
  })
  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (inspection.images.length === 0) return NextResponse.json({ error: 'No images uploaded' }, { status: 400 })

  await prisma.inspection.update({ where: { id: inspectionId }, data: { status: 'IN_PROGRESS' } })

  try {
    const imageUrls = inspection.images.map(img => img.url)
    const vehicleInfo = {
      make: inspection.vehicle.make,
      model: inspection.vehicle.model,
      year: inspection.vehicle.year,
      licensePlate: inspection.vehicle.licensePlate,
    }

    const result = await runInspectionPipeline(imageUrls, vehicleInfo, inspection.type)

    // Build legacy-compatible aiReport JSON (keeps report page working)
    const aiReport = {
      overallCondition: result.report.conditionLabel.toLowerCase(),
      overallScore: result.report.overallScore,
      letterGrade: result.report.letterGrade,
      damages: result.damages.map(d => ({
        type: d.type,
        severity: d.severity,
        location: d.location,
        description: d.description,
        estimatedCost: Math.round(d.estimatedCostPKR / 280), // approx USD
        estimatedCostPKR: d.estimatedCostPKR,
        isNew: false,
        confidence: d.confidence,
        frameCount: d.frameCount,
        panelCode: d.panelCode,
      })),
      summary: result.report.executiveSummary,
      recommendation: result.report.recommendation,
      recommendations: result.report.nextSteps,
      totalEstimatedCost: result.damages.reduce((s, d) => s + Math.round(d.estimatedCostPKR / 280), 0),
      totalEstimatedCostPKR: result.report.totalRepairCostPKR,
      coverageStatement: result.report.coverageStatement,
      confidenceLevel: result.report.confidenceLevel,
      framesAnalyzed: result.framesAnalyzed,
      qualityScore: result.qualityScore,
      disclaimer: result.report.disclaimer,
    }

    await prisma.$transaction([
      prisma.damage.deleteMany({ where: { inspectionId } }),
      ...result.damages.map(d =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma.damage.create as any)({
          data: {
            inspectionId,
            type: d.type,
            severity: d.severity,
            location: d.location,
            description: d.description,
            estimatedCost: Math.round(d.estimatedCostPKR / 280),
            imageUrl: d.imageUrl,
            isNew: false,
            confidence: d.confidence,
            frameCount: d.frameCount,
            panelCode: d.panelCode,
          },
        })
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.inspection.update as any)({
        where: { id: inspectionId },
        data: {
          status: 'COMPLETED',
          aiReport: JSON.stringify(aiReport),
          qualityScore: result.qualityScore,
          framesAnalyzed: result.framesAnalyzed,
          overallGrade: result.overallGrade,
        },
      }),
      prisma.user.update({ where: { id: userId }, data: { creditsUsed: { increment: 1 } } }),
    ])

    return NextResponse.json(aiReport)
  } catch (err) {
    await prisma.inspection.update({ where: { id: inspectionId }, data: { status: 'PENDING' } })
    console.error('Pipeline error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
