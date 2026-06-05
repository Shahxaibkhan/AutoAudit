import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ ok: true }) // don't reveal if email exists
    if (user.emailVerified) return NextResponse.json({ ok: true }) // already verified

    // Delete any existing token and create a fresh one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    await sendVerificationEmail(email, token)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend verification error:', err)
    return NextResponse.json({ error: 'Failed to resend' }, { status: 500 })
  }
}
