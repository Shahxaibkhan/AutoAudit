import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  }
  return _stripe
}

export const STRIPE_PRICES: Record<string, string | undefined> = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  GROWTH:  process.env.STRIPE_PRICE_GROWTH,
  PRO:     process.env.STRIPE_PRICE_PRO,
}

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}
