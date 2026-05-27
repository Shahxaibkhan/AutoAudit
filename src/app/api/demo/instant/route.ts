import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEMO_PASSWORD = 'Demo1234!'

const INDUSTRY_CONFIG: Record<string, { email: string; name: string; business: string }> = {
  rental:    { email: 'demo-rental@autoauditai.com',    name: 'Demo User',    business: 'Lahore Premium Car Rentals (Demo)' },
  dealer:    { email: 'demo-dealer@autoauditai.com',    name: 'Demo Dealer',  business: 'PakWheels Premium Autos (Demo)' },
  fleet:     { email: 'demo-fleet@autoauditai.com',     name: 'Demo Fleet',   business: 'Metro Ride Fleet Management (Demo)' },
  insurance: { email: 'demo-insurance@autoauditai.com', name: 'Demo Claims',  business: 'Shield Auto Insurance — Claims Dept (Demo)' },
  bodyshop:  { email: 'demo-bodyshop@autoauditai.com',  name: 'Demo Shop',    business: 'Premium Auto Repair Works (Demo)' },
  leasing:   { email: 'demo-leasing@autoauditai.com',   name: 'Demo Leasing', business: 'AutoLease Corporate Solutions (Demo)' },
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry') || 'rental'
  const config = INDUSTRY_CONFIG[industry] ?? INDUSTRY_CONFIG.rental

  try {
    let user = await prisma.user.findUnique({ where: { email: config.email } })

    if (!user) {
      const hashed = await bcrypt.hash(DEMO_PASSWORD, 10)
      user = await prisma.user.create({
        data: { name: config.name, email: config.email, password: hashed, businessName: config.business },
      })
      await SEED_FNS[industry]?.(user.id)
    }

    return NextResponse.json({ email: config.email, password: DEMO_PASSWORD })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[demo/instant] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

const SEED_FNS: Record<string, (userId: string) => Promise<void>> = {
  rental: seedRental,
  dealer: seedDealer,
  fleet: seedFleet,
  insurance: seedInsurance,
  bodyshop: seedBodyShop,
  leasing: seedLeasing,
}

// ─── RENTAL ────────────────────────────────────────────────────────────────────
async function seedRental(userId: string) {
  const now = new Date()
  const d3 = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  const corolla = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'LHR-5521', color: 'White', ownerId: userId },
  })
  const corollaPre = await prisma.inspection.create({ data: {
    vehicleId: corolla.id, userId, type: 'PRE_RENTAL', status: 'COMPLETED',
    renterName: 'Ali Hassan', renterPhone: '+92 300 1234567',
    rentalStart: d3(4), rentalEnd: d3(1),
    aiReport: JSON.stringify({ overallCondition: 'fair', damages: [
      { type: 'scratch', severity: 'minor', location: 'Front bumper left', description: 'Light 8cm surface scratch', estimatedCost: 45, isNew: false },
      { type: 'dent', severity: 'moderate', location: 'Rear left door', description: '4cm dent, no paint damage', estimatedCost: 180, isNew: false },
      { type: 'paint_chip', severity: 'minor', location: 'Hood centre', description: 'Two stone chip marks', estimatedCost: 60, isNew: false },
    ], summary: 'Fair condition. 3 pre-existing items documented.', recommendations: ['Schedule hood chip repair'], totalEstimatedCost: 285 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: corollaPre.id, type: 'scratch', severity: 'minor', location: 'Front bumper left', description: 'Light 8cm surface scratch', estimatedCost: 45, isNew: false },
    { inspectionId: corollaPre.id, type: 'dent', severity: 'moderate', location: 'Rear left door', description: '4cm dent, no paint damage', estimatedCost: 180, isNew: false },
    { inspectionId: corollaPre.id, type: 'paint_chip', severity: 'minor', location: 'Hood centre', description: 'Two stone chip marks', estimatedCost: 60, isNew: false },
  ]})
  const corollaPost = await prisma.inspection.create({ data: {
    vehicleId: corolla.id, userId, type: 'POST_RENTAL', status: 'COMPLETED',
    renterName: 'Ali Hassan', renterPhone: '+92 300 1234567',
    rentalStart: d3(4), rentalEnd: d3(1), preInspectionId: corollaPre.id,
    aiReport: JSON.stringify({ newDamages: [
      { type: 'crack', severity: 'severe', location: 'Rear bumper right', description: '15cm impact crack, plastic split — parking collision', estimatedCost: 320, isNew: true },
    ], existingDamages: [], summary: '1 new damage detected. Renter liable for $320.', hasNewDamage: true, totalNewDamageCost: 320 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: corollaPost.id, type: 'crack', severity: 'severe', location: 'Rear bumper right', description: '15cm impact crack — parking collision', estimatedCost: 320, isNew: true },
    { inspectionId: corollaPost.id, type: 'scratch', severity: 'minor', location: 'Front bumper left', description: 'Pre-existing scratch', estimatedCost: 45, isNew: false },
  ]})

  const civic = await prisma.vehicle.create({
    data: { make: 'Honda', model: 'Civic', year: 2023, licensePlate: 'KHI-7743', color: 'Silver', ownerId: userId },
  })
  const civicPre = await prisma.inspection.create({ data: {
    vehicleId: civic.id, userId, type: 'PRE_RENTAL', status: 'COMPLETED',
    renterName: 'Fatima Sheikh', renterPhone: '+92 321 9876543', rentalStart: d3(2), rentalEnd: now,
    aiReport: JSON.stringify({ overallCondition: 'good', damages: [{ type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch on edge', estimatedCost: 35, isNew: false }], summary: 'Good condition. One minor scratch.', recommendations: [], totalEstimatedCost: 35 }),
  }})
  await prisma.damage.create({ data: { inspectionId: civicPre.id, type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Hairline scratch', estimatedCost: 35, isNew: false }})
  const civicPost = await prisma.inspection.create({ data: {
    vehicleId: civic.id, userId, type: 'POST_RENTAL', status: 'COMPLETED',
    renterName: 'Fatima Sheikh', renterPhone: '+92 321 9876543', rentalStart: d3(2), rentalEnd: now, preInspectionId: civicPre.id,
    aiReport: JSON.stringify({ newDamages: [], existingDamages: [], summary: 'No new damage. Clean return.', hasNewDamage: false, totalNewDamageCost: 0 }),
  }})
  await prisma.damage.create({ data: { inspectionId: civicPost.id, type: 'scratch', severity: 'minor', location: 'Front left door', description: 'Pre-existing hairline scratch', estimatedCost: 35, isNew: false }})

  await prisma.vehicle.create({ data: { make: 'Suzuki', model: 'Alto', year: 2021, licensePlate: 'ISB-3310', color: 'Red', ownerId: userId } })
}

// ─── DEALER ────────────────────────────────────────────────────────────────────
async function seedDealer(userId: string) {
  const now = new Date()
  const d = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  const lc = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Land Cruiser', year: 2021, licensePlate: 'LHR-LC-2021', color: 'White', vin: 'JTMHV05J904012345', ownerId: userId, notes: 'Fully loaded, GXR grade, 72,000km' },
  })
  const lcPre = await prisma.inspection.create({ data: {
    vehicleId: lc.id, userId, type: 'PRE_SALE', status: 'COMPLETED',
    renterName: 'Buying: Usman Mirza', renterPhone: '+92 333 9876543', rentalStart: d(5), rentalEnd: d(5),
    aiReport: JSON.stringify({ overallCondition: 'good', damages: [
      { type: 'scratch', severity: 'minor', location: 'Driver door lower edge', description: 'Light 6cm scratch from door contact', estimatedCost: 55, isNew: false },
      { type: 'paint_chip', severity: 'minor', location: 'Front hood', description: 'Three stone chip marks', estimatedCost: 90, isNew: false },
      { type: 'dent', severity: 'minor', location: 'Rear bumper right corner', description: 'Small 3cm parking dent', estimatedCost: 275, isNew: false },
    ], summary: 'Good condition for age. Three minor pre-existing items. All documented for buyer.', recommendations: ['Fix hood chips to maximize resale value'], totalEstimatedCost: 420 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: lcPre.id, type: 'scratch', severity: 'minor', location: 'Driver door lower edge', description: 'Light 6cm scratch', estimatedCost: 55, isNew: false },
    { inspectionId: lcPre.id, type: 'paint_chip', severity: 'minor', location: 'Front hood', description: 'Three stone chips', estimatedCost: 90, isNew: false },
    { inspectionId: lcPre.id, type: 'dent', severity: 'minor', location: 'Rear bumper right', description: 'Small 3cm parking dent', estimatedCost: 275, isNew: false },
  ]})
  const lcPost = await prisma.inspection.create({ data: {
    vehicleId: lc.id, userId, type: 'POST_SALE', status: 'COMPLETED',
    renterName: 'Buying: Usman Mirza', renterPhone: '+92 333 9876543', rentalStart: d(1), rentalEnd: d(1), preInspectionId: lcPre.id,
    aiReport: JSON.stringify({ newDamages: [{ type: 'scratch', severity: 'minor', location: 'Rear left bumper', description: 'Fresh 4cm scratch from test drive, not present at listing', estimatedCost: 85, isNew: true }], existingDamages: [], summary: '1 new scratch during test drive. Buyer adjusted offer accordingly.', hasNewDamage: true, totalNewDamageCost: 85 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: lcPost.id, type: 'scratch', severity: 'minor', location: 'Rear left bumper', description: 'Fresh scratch from test drive', estimatedCost: 85, isNew: true },
    { inspectionId: lcPost.id, type: 'scratch', severity: 'minor', location: 'Driver door lower edge', description: 'Pre-existing scratch', estimatedCost: 55, isNew: false },
  ]})

  const accord = await prisma.vehicle.create({
    data: { make: 'Honda', model: 'Accord', year: 2022, licensePlate: 'KHI-ACC-22', color: 'Platinum White', vin: 'JHMCV1F50NC001234', ownerId: userId, notes: 'Ex-corporate. 45,000km. Full service history.' },
  })
  const accordPre = await prisma.inspection.create({ data: {
    vehicleId: accord.id, userId, type: 'PRE_SALE', status: 'COMPLETED',
    renterName: 'Buying: Mehriban Ali', renterPhone: '+92 312 4567890', rentalStart: d(3), rentalEnd: d(3),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [{ type: 'paint_chip', severity: 'minor', location: 'Front bumper right', description: 'Single small stone chip, touchable', estimatedCost: 35, isNew: false }], summary: 'Excellent condition. Nearly flawless for age.', recommendations: [], totalEstimatedCost: 35 }),
  }})
  await prisma.damage.create({ data: { inspectionId: accordPre.id, type: 'paint_chip', severity: 'minor', location: 'Front bumper right', description: 'Single stone chip', estimatedCost: 35, isNew: false }})

  await prisma.vehicle.create({ data: { make: 'BMW', model: '320i', year: 2020, licensePlate: 'ISB-BMW-20', color: 'Alpine White', ownerId: userId, notes: 'Imported. 68,000km. Awaiting pre-sale inspection.' } })
}

// ─── FLEET ─────────────────────────────────────────────────────────────────────
async function seedFleet(userId: string) {
  const now = new Date()
  const h = (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000)

  const camry = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Camry', year: 2022, licensePlate: 'FLEET-007', color: 'White', ownerId: userId, notes: 'Careem partner fleet. Driver: Ali Raza (ID: DR-4421)' },
  })
  const camryStart = await prisma.inspection.create({ data: {
    vehicleId: camry.id, userId, type: 'SHIFT_START', status: 'COMPLETED',
    renterName: 'Ali Raza', renterPhone: '+92 300 4421000', rentalStart: h(9), rentalEnd: h(9),
    aiReport: JSON.stringify({ overallCondition: 'good', damages: [{ type: 'scratch', severity: 'minor', location: 'Front bumper centre', description: 'Pre-existing light scratch 5cm', estimatedCost: 40, isNew: false }], summary: 'Fleet vehicle in good condition. One pre-existing scratch documented at shift start.', recommendations: [], totalEstimatedCost: 40 }),
  }})
  await prisma.damage.create({ data: { inspectionId: camryStart.id, type: 'scratch', severity: 'minor', location: 'Front bumper centre', description: 'Pre-existing light scratch', estimatedCost: 40, isNew: false }})
  const camryEnd = await prisma.inspection.create({ data: {
    vehicleId: camry.id, userId, type: 'SHIFT_END', status: 'COMPLETED',
    renterName: 'Ali Raza', renterPhone: '+92 300 4421000', rentalStart: h(9), rentalEnd: h(1), preInspectionId: camryStart.id,
    aiReport: JSON.stringify({ newDamages: [{ type: 'dent', severity: 'moderate', location: 'Rear right door panel', description: '5cm dent — driver accountability flagged. Occurred during shift.', estimatedCost: 150, isNew: true }], existingDamages: [], summary: '1 new dent found at end of shift. Security deposit deduction recommended: $150.', hasNewDamage: true, totalNewDamageCost: 150 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: camryEnd.id, type: 'dent', severity: 'moderate', location: 'Rear right door panel', description: 'New dent during shift — driver accountable', estimatedCost: 150, isNew: true },
    { inspectionId: camryEnd.id, type: 'scratch', severity: 'minor', location: 'Front bumper centre', description: 'Pre-existing scratch', estimatedCost: 40, isNew: false },
  ]})

  const civic = await prisma.vehicle.create({
    data: { make: 'Honda', model: 'Civic', year: 2023, licensePlate: 'FLEET-012', color: 'Silver', ownerId: userId, notes: 'Careem partner fleet. Driver: Sara Ahmed (ID: DR-3312)' },
  })
  const civicStart = await prisma.inspection.create({ data: {
    vehicleId: civic.id, userId, type: 'SHIFT_START', status: 'COMPLETED',
    renterName: 'Sara Ahmed', renterPhone: '+92 321 3312000', rentalStart: h(8), rentalEnd: h(8),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [], summary: 'Excellent condition at shift start. No damage found.', recommendations: [], totalEstimatedCost: 0 }),
  }})
  const civicEnd = await prisma.inspection.create({ data: {
    vehicleId: civic.id, userId, type: 'SHIFT_END', status: 'COMPLETED',
    renterName: 'Sara Ahmed', renterPhone: '+92 321 3312000', rentalStart: h(8), rentalEnd: h(1), preInspectionId: civicStart.id,
    aiReport: JSON.stringify({ newDamages: [], existingDamages: [], summary: 'Clean shift. No new damage. Driver cleared.', hasNewDamage: false, totalNewDamageCost: 0 }),
  }})
  void civicEnd

  const swift = await prisma.vehicle.create({
    data: { make: 'Suzuki', model: 'Swift', year: 2022, licensePlate: 'FLEET-019', color: 'Blue', ownerId: userId, notes: 'Bykea fleet. Driver: Imran Khan (ID: DR-5519). Shift end pending.' },
  })
  await prisma.inspection.create({ data: {
    vehicleId: swift.id, userId, type: 'SHIFT_START', status: 'COMPLETED',
    renterName: 'Imran Khan', renterPhone: '+92 333 5519000', rentalStart: h(4), rentalEnd: h(4),
    aiReport: JSON.stringify({ overallCondition: 'good', damages: [], summary: 'Good condition at shift start.', recommendations: [], totalEstimatedCost: 0 }),
  }})
}

// ─── INSURANCE ─────────────────────────────────────────────────────────────────
async function seedInsurance(userId: string) {
  const now = new Date()
  const d = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  const altima = await prisma.vehicle.create({
    data: { make: 'Nissan', model: 'Altima', year: 2022, licensePlate: 'KHI-9921', color: 'Black', vin: '1N4BL4EV8NC123456', ownerId: userId, notes: 'Policy: SHD-2024-88432. Claimant: Bilal Chaudhry' },
  })
  const altimaPre = await prisma.inspection.create({ data: {
    vehicleId: altima.id, userId, type: 'PRE_CLAIM', status: 'COMPLETED',
    renterName: 'Bilal Chaudhry', renterPhone: '+92 300 9921000', rentalStart: d(30), rentalEnd: d(30),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [], summary: 'Vehicle in showroom condition at policy inception. No pre-existing damage.', recommendations: [], totalEstimatedCost: 0 }),
  }})
  const altimaPost = await prisma.inspection.create({ data: {
    vehicleId: altima.id, userId, type: 'POST_CLAIM', status: 'COMPLETED',
    renterName: 'Bilal Chaudhry', renterPhone: '+92 300 9921000', rentalStart: d(30), rentalEnd: d(2), preInspectionId: altimaPre.id,
    notes: 'Claim #CLM-2024-4421. Frontal collision on Shahrah-e-Faisal.',
    aiReport: JSON.stringify({ newDamages: [
      { type: 'crack', severity: 'severe', location: 'Front bumper assembly', description: 'Severe impact crack, full bumper replacement needed', estimatedCost: 1200, isNew: true },
      { type: 'dent', severity: 'severe', location: 'Front hood', description: 'Major dent from frontal impact', estimatedCost: 800, isNew: true },
      { type: 'broken', severity: 'severe', location: 'Right headlight assembly', description: 'Headlight unit shattered', estimatedCost: 800, isNew: true },
    ], existingDamages: [], summary: 'Major frontal collision. 3 severe items. Claim approved: $2,800. Processing complete.', hasNewDamage: true, totalNewDamageCost: 2800 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: altimaPost.id, type: 'crack', severity: 'severe', location: 'Front bumper assembly', description: 'Severe impact crack', estimatedCost: 1200, isNew: true },
    { inspectionId: altimaPost.id, type: 'dent', severity: 'severe', location: 'Front hood', description: 'Major dent from frontal impact', estimatedCost: 800, isNew: true },
    { inspectionId: altimaPost.id, type: 'broken', severity: 'severe', location: 'Right headlight assembly', description: 'Headlight unit shattered', estimatedCost: 800, isNew: true },
  ]})

  const yaris = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Yaris', year: 2023, licensePlate: 'LHR-4412', color: 'Red', ownerId: userId, notes: 'Policy: SHD-2024-77210. Claimant: Nida Farooq. Minor fender bender.' },
  })
  const yarisPre = await prisma.inspection.create({ data: {
    vehicleId: yaris.id, userId, type: 'PRE_CLAIM', status: 'COMPLETED',
    renterName: 'Nida Farooq', renterPhone: '+92 312 4412000', rentalStart: d(20), rentalEnd: d(20),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [], summary: 'Excellent condition at policy start.', recommendations: [], totalEstimatedCost: 0 }),
  }})
  const yarisPost = await prisma.inspection.create({ data: {
    vehicleId: yaris.id, userId, type: 'POST_CLAIM', status: 'COMPLETED',
    renterName: 'Nida Farooq', renterPhone: '+92 312 4412000', rentalStart: d(20), rentalEnd: d(1), preInspectionId: yarisPre.id,
    aiReport: JSON.stringify({ newDamages: [{ type: 'dent', severity: 'minor', location: 'Rear bumper', description: 'Minor fender bender dent 8cm', estimatedCost: 320, isNew: true }], existingDamages: [], summary: 'Minor rear collision. 1 item. Claim approved: $320.', hasNewDamage: true, totalNewDamageCost: 320 }),
  }})
  await prisma.damage.create({ data: { inspectionId: yarisPost.id, type: 'dent', severity: 'minor', location: 'Rear bumper', description: 'Minor fender bender dent 8cm', estimatedCost: 320, isNew: true }})
  void yarisPre

  const hrv = await prisma.vehicle.create({
    data: { make: 'Honda', model: 'HR-V', year: 2022, licensePlate: 'ISB-7733', color: 'Silver', ownerId: userId, notes: 'Policy: SHD-2024-91100. Disputed claim — pending AI assessment.' },
  })
  await prisma.inspection.create({ data: {
    vehicleId: hrv.id, userId, type: 'PRE_CLAIM', status: 'PENDING',
    renterName: 'Tariq Mehmood', renterPhone: '+92 333 7733000',
    notes: 'Customer claims rear-end collision. Awaiting inspection.',
  }})
}

// ─── BODY SHOP ─────────────────────────────────────────────────────────────────
async function seedBodyShop(userId: string) {
  const now = new Date()
  const d = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  const merc = await prisma.vehicle.create({
    data: { make: 'Mercedes-Benz', model: 'C200', year: 2021, licensePlate: 'DHA-C200', color: 'Obsidian Black', ownerId: userId, notes: 'Job #WO-2024-0441. Customer: Shahid Iqbal. Bumper replacement approved.' },
  })
  const mercPre = await prisma.inspection.create({ data: {
    vehicleId: merc.id, userId, type: 'PRE_REPAIR', status: 'COMPLETED',
    renterName: 'Shahid Iqbal', renterPhone: '+92 300 4410001', rentalStart: d(7), rentalEnd: d(7),
    notes: 'Customer reported parking lot collision. Insurance pre-approved repair.',
    aiReport: JSON.stringify({ overallCondition: 'fair', damages: [
      { type: 'crack', severity: 'moderate', location: 'Front bumper centre', description: '12cm impact crack from parking incident', estimatedCost: 450, isNew: false },
      { type: 'scratch', severity: 'minor', location: 'Front bumper right side', description: 'Deep 8cm scratch alongside crack', estimatedCost: 80, isNew: false },
    ], summary: 'Front bumper repair required. Customer approved estimate $530.', recommendations: ['Full bumper replacement recommended over repair', 'Paint match required for seamless finish'], totalEstimatedCost: 530 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: mercPre.id, type: 'crack', severity: 'moderate', location: 'Front bumper centre', description: '12cm impact crack', estimatedCost: 450, isNew: false },
    { inspectionId: mercPre.id, type: 'scratch', severity: 'minor', location: 'Front bumper right', description: 'Deep 8cm scratch', estimatedCost: 80, isNew: false },
  ]})
  const mercPost = await prisma.inspection.create({ data: {
    vehicleId: merc.id, userId, type: 'POST_REPAIR', status: 'COMPLETED',
    renterName: 'Shahid Iqbal', renterPhone: '+92 300 4410001', rentalStart: d(7), rentalEnd: d(1), preInspectionId: mercPre.id,
    aiReport: JSON.stringify({ newDamages: [], existingDamages: [], summary: 'Repair complete. Bumper replaced, paint matched to factory spec. Customer satisfied. Vehicle delivered.', hasNewDamage: false, totalNewDamageCost: 0 }),
  }})
  void mercPost

  const fortuner = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Fortuner', year: 2023, licensePlate: 'GRW-4F22', color: 'Pearl White', ownerId: userId, notes: 'Job #WO-2024-0448. Customer: Faisal Nawaz. Side panel repair. In progress.' },
  })
  const fortunerPre = await prisma.inspection.create({ data: {
    vehicleId: fortuner.id, userId, type: 'PRE_REPAIR', status: 'COMPLETED',
    renterName: 'Faisal Nawaz', renterPhone: '+92 321 4422000', rentalStart: d(2), rentalEnd: d(2),
    aiReport: JSON.stringify({ overallCondition: 'fair', damages: [
      { type: 'dent', severity: 'moderate', location: 'Driver side panel', description: 'Side-swipe dent 20cm length, paint scraped', estimatedCost: 380, isNew: false },
      { type: 'scratch', severity: 'moderate', location: 'Driver door', description: 'Deep key scratch running full door length', estimatedCost: 220, isNew: false },
    ], summary: 'Side-swipe damage documented. Repair estimate $600. Parts on order.', recommendations: ['Panel beating + respray required', 'Door may need replacement if metal too thin after dent removal'], totalEstimatedCost: 600 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: fortunerPre.id, type: 'dent', severity: 'moderate', location: 'Driver side panel', description: 'Side-swipe dent 20cm', estimatedCost: 380, isNew: false },
    { inspectionId: fortunerPre.id, type: 'scratch', severity: 'moderate', location: 'Driver door', description: 'Deep key scratch full door', estimatedCost: 220, isNew: false },
  ]})
}

// ─── LEASING ────────────────────────────────────────────────────────────────────
async function seedLeasing(userId: string) {
  const now = new Date()
  const d = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)
  const yr = (n: number) => new Date(now.getTime() - n * 365 * 24 * 60 * 60 * 1000)

  const bmw = await prisma.vehicle.create({
    data: { make: 'BMW', model: '520i', year: 2021, licensePlate: 'CORP-BMW1', color: 'Mineral White', vin: 'WBA52BH04MCF12345', ownerId: userId, notes: 'Lease #ALC-2021-0034. Lessee: Zafar Industries Ltd. 3yr term. Ended.' },
  })
  const bmwStart = await prisma.inspection.create({ data: {
    vehicleId: bmw.id, userId, type: 'LEASE_START', status: 'COMPLETED',
    renterName: 'Zafar Industries Ltd', renterPhone: '+92 51 111 0034', rentalStart: yr(3), rentalEnd: yr(3),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [], summary: 'Showroom condition at lease start. No damage. Vehicle accepted.', recommendations: [], totalEstimatedCost: 0 }),
  }})
  const bmwEnd = await prisma.inspection.create({ data: {
    vehicleId: bmw.id, userId, type: 'LEASE_END', status: 'COMPLETED',
    renterName: 'Zafar Industries Ltd', renterPhone: '+92 51 111 0034', rentalStart: yr(3), rentalEnd: now, preInspectionId: bmwStart.id,
    notes: 'End of 3-year lease. Excess wear charges apply.',
    aiReport: JSON.stringify({ newDamages: [
      { type: 'dent', severity: 'moderate', location: 'Rear left door', description: '4cm parking dent — exceeds fair wear allowance', estimatedCost: 350, isNew: true },
      { type: 'scratch', severity: 'moderate', location: 'Front bumper', description: '15cm scratch beyond normal wear', estimatedCost: 280, isNew: true },
      { type: 'paint_chip', severity: 'minor', location: 'Hood — multiple', description: '8+ chips exceeding wear policy limits', estimatedCost: 570, isNew: true },
    ], existingDamages: [], summary: 'Excess wear found at lease return. 3 items exceed policy allowance. Charge: $1,200.', hasNewDamage: true, totalNewDamageCost: 1200 }),
  }})
  await prisma.damage.createMany({ data: [
    { inspectionId: bmwEnd.id, type: 'dent', severity: 'moderate', location: 'Rear left door', description: 'Parking dent exceeds fair wear', estimatedCost: 350, isNew: true },
    { inspectionId: bmwEnd.id, type: 'scratch', severity: 'moderate', location: 'Front bumper', description: '15cm scratch beyond normal wear', estimatedCost: 280, isNew: true },
    { inspectionId: bmwEnd.id, type: 'paint_chip', severity: 'minor', location: 'Hood — multiple', description: '8+ chips exceeding wear policy', estimatedCost: 570, isNew: true },
  ]})

  const corolla = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'CORP-TOY2', color: 'Silver', ownerId: userId, notes: 'Lease #ALC-2022-0071. Lessee: Apex Pharma. 2yr term. Clean return.' },
  })
  const corollaStart = await prisma.inspection.create({ data: {
    vehicleId: corolla.id, userId, type: 'LEASE_START', status: 'COMPLETED',
    renterName: 'Apex Pharma', renterPhone: '+92 42 111 0071', rentalStart: yr(2), rentalEnd: yr(2),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [], summary: 'Excellent condition at lease start.', recommendations: [], totalEstimatedCost: 0 }),
  }})
  const corollaEnd = await prisma.inspection.create({ data: {
    vehicleId: corolla.id, userId, type: 'LEASE_END', status: 'COMPLETED',
    renterName: 'Apex Pharma', renterPhone: '+92 42 111 0071', rentalStart: yr(2), rentalEnd: d(5), preInspectionId: corollaStart.id,
    aiReport: JSON.stringify({ newDamages: [], existingDamages: [], summary: 'Clean lease return. No excess wear. Full deposit refunded.', hasNewDamage: false, totalNewDamageCost: 0 }),
  }})
  void corollaEnd

  const crv = await prisma.vehicle.create({
    data: { make: 'Honda', model: 'CR-V', year: 2023, licensePlate: 'CORP-HON3', color: 'Lunar Silver', ownerId: userId, notes: 'Lease #ALC-2023-0094. Lessee: TechBridge Ltd. 3yr term. Active — 14 months remaining.' },
  })
  await prisma.inspection.create({ data: {
    vehicleId: crv.id, userId, type: 'LEASE_START', status: 'COMPLETED',
    renterName: 'TechBridge Ltd', renterPhone: '+92 21 111 0094', rentalStart: d(395), rentalEnd: d(395),
    aiReport: JSON.stringify({ overallCondition: 'excellent', damages: [], summary: 'Perfect condition at lease commencement. No issues.', recommendations: [], totalEstimatedCost: 0 }),
  }})
}
