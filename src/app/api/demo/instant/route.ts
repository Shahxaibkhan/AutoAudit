import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEMO_EMAIL = 'demo@carpect.com'
const DEMO_PASSWORD = 'Demo1234!'

const PRE_REPORT = JSON.stringify({
  overallCondition: 'fair',
  damages: [
    { type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch approx. 8cm, paint intact', estimatedCost: 45, isNew: false },
    { type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent approx. 4cm diameter, no paint damage', estimatedCost: 180, isNew: false },
    { type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Two small paint chips from stone impacts', estimatedCost: 60, isNew: false },
  ],
  summary: 'Vehicle in fair condition. Three pre-existing minor to moderate damage items documented before rental.',
  recommendations: ['Schedule touch-up paint for hood chips to prevent rust', 'Rear door dent should be repaired at next service'],
  totalEstimatedCost: 285,
})

const POST_REPORT = JSON.stringify({
  newDamages: [
    { type: 'crack', severity: 'severe', location: 'Rear bumper (right side)', description: 'Clear impact crack approx. 15cm, plastic split — likely parking collision', estimatedCost: 320, isNew: true },
  ],
  existingDamages: [
    { type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch', estimatedCost: 45 },
    { type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent', estimatedCost: 180 },
    { type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Paint chips', estimatedCost: 60 },
  ],
  summary: '1 new damage detected after rental. Rear bumper crack consistent with a parking impact. Renter liable for $320.',
  hasNewDamage: true,
  totalNewDamageCost: 320,
})

const CIVIC_PRE_REPORT = JSON.stringify({
  overallCondition: 'good',
  damages: [
    { type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on door edge', estimatedCost: 35, isNew: false },
  ],
  summary: 'Vehicle in good condition. One minor pre-existing scratch documented.',
  recommendations: ['Touch up door scratch at convenience'],
  totalEstimatedCost: 35,
})

const CLEAN_POST_REPORT = JSON.stringify({
  newDamages: [],
  existingDamages: [{ type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch', estimatedCost: 35 }],
  summary: 'No new damage detected. Honda Civic returned in the same condition as rented.',
  hasNewDamage: false,
  totalNewDamageCost: 0,
})

async function seedDemoData(userId: string) {
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  // Toyota Corolla — damage dispute scenario
  const corolla = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'LHR-5521', color: 'White', ownerId: userId },
  })

  const corollaPre = await prisma.inspection.create({
    data: {
      vehicleId: corolla.id, userId,
      type: 'PRE_RENTAL', status: 'COMPLETED',
      renterName: 'Ali Hassan', renterPhone: '+92 300 1234567',
      rentalStart: threeDaysAgo, rentalEnd: yesterday,
      aiReport: PRE_REPORT,
    },
  })
  await prisma.damage.createMany({
    data: [
      { inspectionId: corollaPre.id, type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch approx. 8cm, paint intact', estimatedCost: 45, isNew: false },
      { inspectionId: corollaPre.id, type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent approx. 4cm diameter, no paint damage', estimatedCost: 180, isNew: false },
      { inspectionId: corollaPre.id, type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Two small paint chips from stone impacts', estimatedCost: 60, isNew: false },
    ],
  })

  const corollaPost = await prisma.inspection.create({
    data: {
      vehicleId: corolla.id, userId,
      type: 'POST_RENTAL', status: 'COMPLETED',
      renterName: 'Ali Hassan', renterPhone: '+92 300 1234567',
      rentalStart: threeDaysAgo, rentalEnd: yesterday,
      preInspectionId: corollaPre.id,
      aiReport: POST_REPORT,
    },
  })
  await prisma.damage.createMany({
    data: [
      { inspectionId: corollaPost.id, type: 'crack', severity: 'severe', location: 'Rear bumper (right side)', description: 'Clear impact crack approx. 15cm, plastic split', estimatedCost: 320, isNew: true },
      { inspectionId: corollaPost.id, type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch approx. 8cm', estimatedCost: 45, isNew: false },
      { inspectionId: corollaPost.id, type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent approx. 4cm diameter', estimatedCost: 180, isNew: false },
      { inspectionId: corollaPost.id, type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Paint chips', estimatedCost: 60, isNew: false },
    ],
  })

  // Honda Civic — clean return scenario
  const civic = await prisma.vehicle.create({
    data: { make: 'Honda', model: 'Civic', year: 2023, licensePlate: 'KHI-7743', color: 'Silver', ownerId: userId },
  })

  const civicPre = await prisma.inspection.create({
    data: {
      vehicleId: civic.id, userId,
      type: 'PRE_RENTAL', status: 'COMPLETED',
      renterName: 'Fatima Sheikh', renterPhone: '+92 321 9876543',
      rentalStart: twoDaysAgo, rentalEnd: now,
      aiReport: CIVIC_PRE_REPORT,
    },
  })
  await prisma.damage.createMany({
    data: [
      { inspectionId: civicPre.id, type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on door edge', estimatedCost: 35, isNew: false },
    ],
  })

  const civicPost = await prisma.inspection.create({
    data: {
      vehicleId: civic.id, userId,
      type: 'POST_RENTAL', status: 'COMPLETED',
      renterName: 'Fatima Sheikh', renterPhone: '+92 321 9876543',
      rentalStart: twoDaysAgo, rentalEnd: now,
      preInspectionId: civicPre.id,
      aiReport: CLEAN_POST_REPORT,
    },
  })
  await prisma.damage.createMany({
    data: [
      { inspectionId: civicPost.id, type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch', estimatedCost: 35, isNew: false },
    ],
  })

  // Suzuki Alto — pending inspection
  await prisma.vehicle.create({
    data: { make: 'Suzuki', model: 'Alto', year: 2021, licensePlate: 'ISB-3310', color: 'Red', ownerId: userId },
  })
}

export async function GET() {
  try {
    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })

    if (!user) {
      const hashed = await bcrypt.hash(DEMO_PASSWORD, 10)
      user = await prisma.user.create({
        data: {
          name: 'Demo User',
          email: DEMO_EMAIL,
          password: hashed,
          businessName: 'Lahore Premium Rentals (Demo)',
          phone: '+92 300 0000000',
        },
      })
      await seedDemoData(user.id)
    }

    return NextResponse.json({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[demo/instant] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
