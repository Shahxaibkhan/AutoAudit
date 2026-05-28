export type PlanKey = 'TRIAL' | 'STARTER' | 'GROWTH' | 'PRO' | 'ENTERPRISE'

export const PLANS: Record<PlanKey, { name: string; credits: number; price: number | null; color: string }> = {
  TRIAL:      { name: 'Free Trial',  credits: 50,     price: null, color: 'teal' },
  STARTER:    { name: 'Starter',     credits: 50,     price: 19,   color: 'slate' },
  GROWTH:     { name: 'Growth',      credits: 200,    price: 49,   color: 'indigo' },
  PRO:        { name: 'Pro',         credits: 600,    price: 99,   color: 'violet' },
  ENTERPRISE: { name: 'Enterprise',  credits: 999999, price: null, color: 'amber' },
}

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

export function canAnalyze(user: UserForCheck): { allowed: boolean; reason?: 'trial_expired' | 'no_credits' | 'subscription_inactive' } {
  // Demo users are always unlimited
  if (user.email.startsWith('demo-') && user.email.includes('@autoauditai.com')) {
    return { allowed: true }
  }

  const plan = user.plan as PlanKey

  if (plan === 'ENTERPRISE') return { allowed: true }

  if (plan === 'TRIAL') {
    if (isTrialExpired(user.trialEndsAt, user.createdAt)) return { allowed: false, reason: 'trial_expired' }
  } else {
    if (user.subStatus !== 'active') return { allowed: false, reason: 'subscription_inactive' }
  }

  if (user.creditsUsed >= user.creditsTotal) return { allowed: false, reason: 'no_credits' }

  return { allowed: true }
}

export function creditsRemaining(used: number, total: number): number {
  return Math.max(0, total - used)
}
