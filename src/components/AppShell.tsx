'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ScanLine, LayoutDashboard, Car, ClipboardList, LogOut, ChevronRight, Menu, X, CreditCard, Zap, ShieldCheck } from 'lucide-react'
import { PLANS, trialDaysLeft, creditsRemaining } from '@/lib/subscription'

const nav = [
  { href: '/dashboard',         label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/vehicles',          label: 'Vehicles',     icon: Car },
  { href: '/inspections',       label: 'Inspections',  icon: ClipboardList },
  { href: '/dashboard/billing', label: 'Billing',      icon: CreditCard },
]

const adminNav = { href: '/dashboard/admin', label: 'Admin', icon: ShieldCheck }

type UsageInfo = {
  plan: string
  creditsUsed: number
  creditsTotal: number
  trialEndsAt: string | null
  createdAt: string
}

function NavLinks({ usage, isAdmin, onNavigate }: { usage: UsageInfo | null; isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const allNav = isAdmin ? [...nav, adminNav] : nav
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">Main</p>
      {allNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        const isAdminLink = href === '/dashboard/admin'
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? isAdminLink ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' : 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${active ? (isAdminLink ? 'text-violet-400' : 'text-teal-400') : 'text-slate-500 group-hover:text-slate-300'}`} />
              {label}
            </div>
            {active && <ChevronRight className={`w-3.5 h-3.5 ${isAdminLink ? 'text-violet-500' : 'text-teal-500'}`} />}
          </Link>
        )
      })}

      {/* Usage pill in sidebar */}
      {usage && (
        <div className="mt-4 mx-1 bg-white/5 rounded-xl p-3 border border-white/8">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400">
              {PLANS[usage.plan as keyof typeof PLANS]?.name ?? 'Trial'}
            </span>
            {usage.plan === 'TRIAL' && (
              <span className="text-xs text-teal-400 font-semibold">
                {trialDaysLeft(usage.trialEndsAt ? new Date(usage.trialEndsAt) : null, new Date(usage.createdAt))}d left
              </span>
            )}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
            {(() => {
              const pct = usage.creditsTotal === 999999 ? 5 : Math.min(100, (usage.creditsUsed / usage.creditsTotal) * 100)
              return (
                <div
                  className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500'}`}
                  style={{ width: `${pct}%` }}
                />
              )
            })()}
          </div>
          <p className="text-xs text-slate-600">
            {usage.creditsTotal === 999999
              ? 'Unlimited'
              : `${creditsRemaining(usage.creditsUsed, usage.creditsTotal)} / ${usage.creditsTotal} analyses left`}
          </p>
        </div>
      )}
    </nav>
  )
}

function UserFooter({ user, onAction }: { user: { name?: string | null; email?: string | null }; onAction?: () => void }) {
  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
  return (
    <div className="p-3 border-t border-white/5">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 mb-1">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-black">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user.name || 'User'}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={() => { onAction?.(); signOut({ callbackUrl: '/login' }) }}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    </div>
  )
}

export default function AppShell({
  user,
  isAdmin = false,
  children,
}: {
  user: { name?: string | null; email?: string | null }
  isAdmin?: boolean
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    fetch('/api/billing/usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
      .catch(() => {})
  }, [pathname]) // refresh on navigation so credits update after analysis

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-slate-950 flex-col h-full shrink-0 border-r border-white/5">
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black text-white tracking-tight">AutoAuditAI</span>
          </Link>
        </div>
        <NavLinks usage={usage} isAdmin={isAdmin} />
        <UserFooter user={user} />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 flex flex-col md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black text-white tracking-tight">AutoAuditAI</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavLinks usage={usage} isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
        <UserFooter user={user} onAction={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <ScanLine className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">AutoAuditAI</span>
          </Link>
          {/* Mobile credits pill */}
          {usage && (
            <Link href="/dashboard/billing" className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full text-xs font-bold">
              <Zap className="w-3 h-3" />
              {usage.creditsTotal === 999999 ? '∞' : creditsRemaining(usage.creditsUsed, usage.creditsTotal)}
            </Link>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
