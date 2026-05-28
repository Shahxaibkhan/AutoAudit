import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { isAdminEmail } from '@/lib/subscription'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const admin = isAdminEmail(session.user?.email)

  return <AppShell user={session.user!} isAdmin={admin}>{children}</AppShell>
}
