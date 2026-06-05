import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

/* ── In-memory rate limiter: max 5 attempts per email per 15 minutes ── */
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(email)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

function clearRateLimit(email: string) {
  loginAttempts.delete(email)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const emailKey = credentials.email.toLowerCase()

        // Rate limit check
        if (!checkRateLimit(emailKey)) {
          throw new Error('too_many_attempts')
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        clearRateLimit(emailKey)

        // Block unverified emails (demo accounts bypass)
        const isDemo = user.email.startsWith('demo-') && user.email.includes('@autoauditai.com')
        if (!isDemo && !user.emailVerified) {
          throw new Error('email_not_verified')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          creditsUsed: user.creditsUsed,
          creditsTotal: user.creditsTotal,
          trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan
        token.creditsUsed = (user as any).creditsUsed
        token.creditsTotal = (user as any).creditsTotal
        token.trialEndsAt = (user as any).trialEndsAt
      }
      if (trigger === 'update') {
        const fresh = await prisma.user.findUnique({ where: { id: token.id as string } })
        if (fresh) {
          token.plan = fresh.plan
          token.creditsUsed = fresh.creditsUsed
          token.creditsTotal = fresh.creditsTotal
          token.trialEndsAt = fresh.trialEndsAt?.toISOString() ?? null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as any
        u.id = token.id
        u.plan = token.plan
        u.creditsUsed = token.creditsUsed
        u.creditsTotal = token.creditsTotal
        u.trialEndsAt = token.trialEndsAt
      }
      return session
    },
  },
}
