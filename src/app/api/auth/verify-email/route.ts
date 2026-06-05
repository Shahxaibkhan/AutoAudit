import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record || record.identifier !== email || record.expires < new Date()) {
    return NextResponse.redirect(new URL('/login?error=token_expired', req.url))
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ])

  return NextResponse.redirect(new URL('/login?verified=1', req.url))
}
