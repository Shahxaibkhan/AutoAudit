export type PlanKey = 'TRIAL' | 'SALES' | 'STARTER' | 'GROWTH' | 'PRO' | 'ENTERPRISE'

export const PLANS: Record<PlanKey, { name: string; credits: number; price: number | null; color: string; badge: string }> = {
  TRIAL:      { name: 'Free Trial',  credits: 3,      price: null, color: 'teal',   badge: 'bg-teal-50 text-teal-700' },
  SALES:      { name: 'Sales',       credits: 999999, price: null, color: 'violet', badge: 'bg-violet-50 text-violet-700' },
  STARTER:    { name: 'Starter',     credits: 50,     price: 19,   color: 'slate',  badge: 'bg-slate-100 text-slate-700' },
  GROWTH:     { name: 'Growth',      credits: 200,    price: 49,   color: 'indigo', badge: 'bg-indigo-50 text-indigo-700' },
  PRO:        { name: 'Pro',         credits: 600,    price: 99,   color: 'violet', badge: 'bg-violet-50 text-violet-700' },
  ENTERPRISE: { name: 'Enterprise',  credits: 999999, price: null, color: 'amber',  badge: 'bg-amber-50 text-amber-700' },
}

export const UNLIMITED_PLANS: PlanKey[] = ['SALES', 'ENTERPRISE']

export function trialDaysLeft(trialEndsAt: Date | null, createdAt: Date): number {
  const end = trialEndsAt ?? new Date(createdAt.getTime() + 14 * 86400_000)
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400_000))
}

export function isTrialExpired(trialEndsAt: Date | null, createdAt: Date): boolean {
  return trialDaysLeft(trialEndsAt, createdAt) === 0
}

type UserForCheck = {
  email: string
  plan: string
  trialEndsAt: Date | null
  createdAt: Date
  creditsUsed: number
  creditsTotal: number
  subStatus: string | null
}

export function canAnalyze(user: UserForCheck): {
  allowed: boolean
  reason?: 'trial_expired' | 'no_credits' | 'subscription_inactive'
} {
  // Demo accounts and sales accounts — always unlimited
  if (user.email.startsWith('demo-') && user.email.includes('@autoauditai.com')) {
    return { allowed: true }
  }

  const plan = user.plan as PlanKey

  if (UNLIMITED_PLANS.includes(plan)) return { allowed: true }

  if (plan === 'TRIAL') {
    if (isTrialExpired(user.trialEndsAt, user.createdAt)) {
      return { allowed: false, reason: 'trial_expired' }
    }
  } else {
    // Paid plan — require active Stripe subscription
    if (user.subStatus !== 'active') {
      return { allowed: false, reason: 'subscription_inactive' }
    }
  }

  if (user.creditsUsed >= user.creditsTotal) {
    return { allowed: false, reason: 'no_credits' }
  }

  return { allowed: true }
}

export function creditsRemaining(used: number, total: number): number {
  return Math.max(0, total - used)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || !process.env.ADMIN_EMAIL) return false
  return process.env.ADMIN_EMAIL.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase())
}
