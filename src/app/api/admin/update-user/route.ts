import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminEmail, PLANS } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, action, value } = await req.json()
  if (!userId || !action) return NextResponse.json({ error: 'userId and action required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  switch (action) {
    case 'set_plan': {
      // Set plan directly — SALES, TRIAL, STARTER, GROWTH, PRO, ENTERPRISE
      const plan = value as string
      if (!PLANS[plan as keyof typeof PLANS]) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
      const credits = PLANS[plan as keyof typeof PLANS].credits
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          creditsTotal: credits,
          creditsUsed: 0,
          subStatus: ['SALES', 'ENTERPRISE', 'TRIAL'].includes(plan) ? null : 'active',
        },
      })
      break
    }

    case 'gift_credits': {
      // Add N credits to this user's total (doesn't reset used count)
      const amount = Number(value) || 20
      await prisma.user.update({
        where: { id: userId },
        data: { creditsTotal: { increment: amount } },
      })
      break
    }

    case 'extend_trial': {
      // Extend trial end date by N days (default 7)
      const days = Number(value) || 7
      const currentEnd = user.trialEndsAt ?? new Date(user.createdAt.getTime() + 14 * 86400_000)
      const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + days * 86400_000)
      await prisma.user.update({
        where: { id: userId },
        data: { trialEndsAt: newEnd, plan: 'TRIAL' },
      })
      break
    }

    case 'reset_trial': {
      // Reset back to a fresh 3-credit trial
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'TRIAL',
          creditsUsed: 0,
          creditsTotal: 3,
          trialEndsAt: new Date(Date.now() + 14 * 86400_000),
          stripeSubId: null,
          subStatus: null,
          subPeriodEnd: null,
        },
      })
      break
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
