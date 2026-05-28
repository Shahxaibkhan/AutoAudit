import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/subscription'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

function planFromPriceId(priceId: string): string | null {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER ?? '']: 'STARTER',
    [process.env.STRIPE_PRICE_GROWTH  ?? '']: 'GROWTH',
    [process.env.STRIPE_PRICE_PRO     ?? '']: 'PRO',
  }
  return map[priceId] ?? null
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret && sig) {
      event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Dev fallback: parse without signature verification
      event = JSON.parse(body) as Stripe.Event
    }
  } catch {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session
        if (cs.mode !== 'subscription') break
        const userId = cs.metadata?.userId
        const plan = cs.metadata?.plan
        if (!userId || !plan) break

        const sub = await getStripe().subscriptions.retrieve(cs.subscription as string)
        const priceId = sub.items.data[0]?.price.id
        const resolvedPlan = planFromPriceId(priceId) ?? plan
        const credits = PLANS[resolvedPlan as keyof typeof PLANS]?.credits ?? 50

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: resolvedPlan,
            stripeSubId: sub.id,
            subStatus: sub.status,
            subPeriodEnd: new Date((sub as any).current_period_end * 1000),
            creditsTotal: credits,
            creditsUsed: 0,
            creditsPeriodStart: new Date(),
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const priceId = sub.items.data[0]?.price.id
        const plan = planFromPriceId(priceId)
        const credits = plan ? (PLANS[plan as keyof typeof PLANS]?.credits ?? 50) : undefined

        await prisma.user.update({
          where: { id: userId },
          data: {
            ...(plan ? { plan } : {}),
            subStatus: sub.status,
            stripeSubId: sub.id,
            subPeriodEnd: new Date((sub as any).current_period_end * 1000),
            ...(credits !== undefined ? { creditsTotal: credits } : {}),
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'TRIAL',
            subStatus: 'canceled',
            stripeSubId: null,
            subPeriodEnd: null,
            creditsTotal: 50,
            creditsUsed: 0,
          },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason !== 'subscription_cycle') break

        const customerId = invoice.customer as string
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
        if (!user) break

        const credits = PLANS[user.plan as keyof typeof PLANS]?.credits ?? 50

        await prisma.user.update({
          where: { id: user.id },
          data: {
            creditsUsed: 0,
            creditsTotal: credits,
            creditsPeriodStart: new Date(),
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
        if (!user) break
        await prisma.user.update({ where: { id: user.id }, data: { subStatus: 'past_due' } })
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
