import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PRE_REPORT = JSON.stringify({
  overallCondition: 'fair',
  damages: [
    { type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch approx. 8cm, paint intact', estimatedCost: 45, isNew: false },
    { type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent approx. 4cm diameter, no paint damage', estimatedCost: 180, isNew: false },
    { type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Two small paint chips from stone impacts', estimatedCost: 60, isNew: false },
  ],
  summary: 'Vehicle in fair condition. Three pre-existing minor to moderate damage items documented before rental.',
  recommendations: [
    'Schedule touch-up paint for hood chips to prevent rust',
    'Rear door dent should be repaired at next service',
    'Monitor front bumper scratch for any worsening',
  ],
  totalEstimatedCost: 285,
})

const POST_REPORT = JSON.stringify({
  newDamages: [
    { type: 'crack', severity: 'severe', location: 'Rear bumper (right side)', description: 'Clear impact crack approx. 15cm, plastic split — likely parking collision', estimatedCost: 320, isNew: true },
  ],
  existingDamages: [
    { type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch approx. 8cm, paint intact', estimatedCost: 45 },
    { type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent approx. 4cm diameter, no paint damage', estimatedCost: 180 },
    { type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Two small paint chips from stone impacts', estimatedCost: 60 },
  ],
  summary: '1 new damage detected after rental. Rear bumper crack is consistent with a parking impact. Renter is liable for repair cost of $320.',
  hasNewDamage: true,
  totalNewDamageCost: 320,
})

const CLEAN_POST_REPORT = JSON.stringify({
  newDamages: [],
  existingDamages: [
    { type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on door edge, pre-existing', estimatedCost: 35 },
  ],
  summary: 'No new damage detected. Honda Civic returned in the same condition as rented.',
  hasNewDamage: false,
  totalNewDamageCost: 0,
})

const CIVIC_PRE_REPORT = JSON.stringify({
  overallCondition: 'good',
  damages: [
    { type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on door edge, pre-existing', estimatedCost: 35, isNew: false },
  ],
  summary: 'Vehicle in good condition. One minor pre-existing scratch documented.',
  recommendations: ['Touch up door scratch at convenience to prevent rust spread'],
  totalEstimatedCost: 35,
})

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id

  // Clear existing demo data for this user to prevent duplicates
  const existingDemo = await prisma.vehicle.findFirst({
    where: { ownerId: userId, licensePlate: 'DEMO-001' },
  })
  if (existingDemo) {
    return NextResponse.json({ message: 'Demo data already loaded', alreadyExists: true })
  }

  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  // Vehicle 1: Toyota Corolla — has damage dispute (new crack found)
  const corolla = await prisma.vehicle.create({
    data: {
      make: 'Toyota', model: 'Corolla', year: 2022,
      licensePlate: 'DEMO-001', color: 'White',
      ownerId: userId,
      notes: 'Demo vehicle — Lahore fleet car #1',
    },
  })

  const corollaPre = await prisma.inspection.create({
    data: {
      vehicleId: corolla.id, userId,
      type: 'PRE_RENTAL', status: 'COMPLETED',
      renterName: 'Ali Hassan', renterPhone: '+92 300 1234567',
      rentalStart: threeDaysAgo, rentalEnd: yesterday,
      aiReport: PRE_REPORT,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
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
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  })

  await prisma.damage.createMany({
    data: [
      { inspectionId: corollaPost.id, type: 'crack', severity: 'severe', location: 'Rear bumper (right side)', description: 'Clear impact crack approx. 15cm, plastic split — likely parking collision', estimatedCost: 320, isNew: true },
      { inspectionId: corollaPost.id, type: 'scratch', severity: 'minor', location: 'Front bumper (left side)', description: 'Light surface scratch approx. 8cm, paint intact', estimatedCost: 45, isNew: false },
      { inspectionId: corollaPost.id, type: 'dent', severity: 'moderate', location: 'Rear left door panel', description: 'Small dent approx. 4cm diameter, no paint damage', estimatedCost: 180, isNew: false },
      { inspectionId: corollaPost.id, type: 'paint_chip', severity: 'minor', location: 'Hood (centre)', description: 'Two small paint chips from stone impacts', estimatedCost: 60, isNew: false },
    ],
  })

  // Vehicle 2: Honda Civic — clean return (no new damage)
  const civic = await prisma.vehicle.create({
    data: {
      make: 'Honda', model: 'Civic', year: 2023,
      licensePlate: 'DEMO-002', color: 'Silver',
      ownerId: userId,
      notes: 'Demo vehicle — Lahore fleet car #2',
    },
  })

  const civicPre = await prisma.inspection.create({
    data: {
      vehicleId: civic.id, userId,
      type: 'PRE_RENTAL', status: 'COMPLETED',
      renterName: 'Fatima Sheikh', renterPhone: '+92 321 9876543',
      rentalStart: twoDaysAgo, rentalEnd: now,
      aiReport: CIVIC_PRE_REPORT,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
  })

  await prisma.damage.createMany({
    data: [
      { inspectionId: civicPre.id, type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on door edge, pre-existing', estimatedCost: 35, isNew: false },
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
      createdAt: now,
      updatedAt: now,
    },
  })

  await prisma.damage.createMany({
    data: [
      { inspectionId: civicPost.id, type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on door edge, pre-existing', estimatedCost: 35, isNew: false },
    ],
  })

  // Vehicle 3: Suzuki Alto — pending inspection (not yet analyzed)
  const alto = await prisma.vehicle.create({
    data: {
      make: 'Suzuki', model: 'Alto', year: 2021,
      licensePlate: 'DEMO-003', color: 'Red',
      ownerId: userId,
      notes: 'Demo vehicle — awaiting pre-rental inspection',
    },
  })

  await prisma.inspection.create({
    data: {
      vehicleId: alto.id, userId,
      type: 'PRE_RENTAL', status: 'PENDING',
      renterName: 'Usman Tariq', renterPhone: '+92 333 5551234',
      rentalStart: now,
    },
  })

  return NextResponse.json({
    message: 'Demo data loaded successfully',
    vehicles: [
      { name: 'Toyota Corolla (DEMO-001)', status: 'Has damage dispute — new crack found' },
      { name: 'Honda Civic (DEMO-002)', status: 'Clean return — no new damage' },
      { name: 'Suzuki Alto (DEMO-003)', status: 'Pending pre-rental inspection' },
    ],
  })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id

  const demoVehicles = await prisma.vehicle.findMany({
    where: { ownerId: userId, licensePlate: { startsWith: 'DEMO-' } },
    select: { id: true },
  })
  const ids = demoVehicles.map(v => v.id)

  if (ids.length === 0) return NextResponse.json({ message: 'No demo data found' })

  await prisma.vehicle.deleteMany({ where: { id: { in: ids } } })

  return NextResponse.json({ message: 'Demo data removed' })
}
