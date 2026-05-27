import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const url = new URL(req.url)
  const vehicleId = url.searchParams.get('vehicleId')
  const type = url.searchParams.get('type')

  const inspections = await prisma.inspection.findMany({
    where: {
      userId,
      ...(vehicleId && { vehicleId }),
      ...(type && { type }),
    },
    include: {
      vehicle: true,
      images: { take: 1 },
      damages: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(inspections)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const { vehicleId, type, renterName, renterPhone, renterEmail, rentalStart, rentalEnd, preInspectionId, notes } = body

  if (!vehicleId || !type) {
    return NextResponse.json({ error: 'vehicleId and type are required' }, { status: 400 })
  }

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, ownerId: userId } })
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  const inspection = await prisma.inspection.create({
    data: {
      vehicleId,
      userId,
      type,
      status: 'PENDING',
      renterName,
      renterPhone,
      renterEmail,
      rentalStart: rentalStart ? new Date(rentalStart) : null,
      rentalEnd: rentalEnd ? new Date(rentalEnd) : null,
      preInspectionId,
      notes,
    },
  })
  return NextResponse.json(inspection, { status: 201 })
}
