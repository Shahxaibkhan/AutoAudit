import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'AutoAuditAI — AI Car Damage Detection',
  description: 'AI-powered car damage inspection and comparison for rental businesses',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#0f172a',
                color: '#f1f5f9',
                border: '1px solid rgba(20,184,166,0.2)',
                fontSize: '14px',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
