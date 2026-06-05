import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const COMMON_PASSWORDS = [
  'password', 'password1', '123456789', '12345678', 'qwerty123',
  'iloveyou', 'admin123', 'letmein1', 'welcome1', 'monkey123',
  'dragon123', 'master123', 'abc12345', 'passw0rd', 'password123',
  '1234abcd', 'qwerty12', 'sunshine', 'princess', 'football',
]

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (password.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 })
    }
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      return NextResponse.json({ error: 'Password is too common. Please choose a stronger password.' }, { status: 400 })
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } })

    if (!record || record.identifier !== `reset:${email}` || record.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashed },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
