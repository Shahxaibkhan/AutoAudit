import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, stripeConfigured } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST() {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
