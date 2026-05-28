'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ScanLine, LayoutDashboard, Car, ClipboardList, LogOut, ChevronRight, Menu, X } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehicles', icon: Car },
  { href: '/inspections', label: 'Inspections', icon: ClipboardList },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">Main</p>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {label}
            </div>
            {active && <ChevronRight className="w-3.5 h-3.5 text-teal-500" />}
          </Link>
        )
      })}
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
  children,
}: {
  user: { name?: string | null; email?: string | null }
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

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
        <NavLinks />
        <UserFooter user={user} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 flex flex-col md:hidden transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
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
        <NavLinks onNavigate={() => setMobileOpen(false)} />
        <UserFooter user={user} onAction={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <ScanLine className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">AutoAuditAI</span>
          </Link>
          <div className="w-9" />
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
