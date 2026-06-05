import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const COMMON_PASSWORDS = [
  'password', 'password1', '123456789', '12345678', 'qwerty123',
  'iloveyou', 'admin123', 'letmein1', 'welcome1', 'monkey123',
  'dragon123', 'master123', 'abc12345', 'passw0rd', 'password123',
  '1234abcd', 'qwerty12', 'sunshine', 'princess', 'football',
]

export async function POST(req: Request) {
  try {
    const { name, email, password, businessName, phone, industry, tosAccepted } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 })
    }
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      return NextResponse.json({ error: 'Password is too common. Please choose a stronger password.' }, { status: 400 })
    }
    if (!tosAccepted) {
      return NextResponse.json({ error: 'You must accept the Terms of Service to continue' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, businessName, phone,
        industry: industry || null,
        tosAcceptedAt: new Date(),
        plan: 'TRIAL',
        trialEndsAt,
        creditsUsed: 0,
        creditsTotal: 3,
        creditsPeriodStart: new Date(),
      },
    })

    // Generate email verification token (expires 24h)
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    // Send verification email (non-blocking)
    sendVerificationEmail(email, token).catch(err =>
      console.error('Verification email failed:', err)
    )

    return NextResponse.json({ id: user.id, email: user.email, requiresVerification: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
