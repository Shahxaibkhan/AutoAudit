'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Zap, AlertTriangle, TrendingUp, Gift, Clock, ShieldCheck, RotateCcw, ChevronDown, Search, Ban, ExternalLink, XCircle } from 'lucide-react'
import { PLANS, trialDaysLeft, creditsRemaining } from '@/lib/subscription'
import toast from 'react-hot-toast'

interface UserRow {
  id: string
  name: string | null
  email: string
  businessName: string | null
  plan: string
  creditsUsed: number
  creditsTotal: number
  trialEndsAt: string | null
  subStatus: string | null
  createdAt: string
  lastActiveAt: string | null
  inspectionCount: number
  vehicleCount: number
  isBlocked: boolean
}

interface FailedInspection {
  id: string
  status: string
  type: string
  imageCount: number
  vehicle: string
  licensePlate: string
  userName: string | null
  userEmail: string
  createdAt: string
  stuckFor: number
}

function PlanBadge({ plan }: { plan: string }) {
  const info = PLANS[plan as keyof typeof PLANS]
  if (!info) return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{plan}</span>
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${info.badge}`}>{info.name}</span>
}

function TrialStatus({ user }: { user: UserRow }) {
  if (user.plan !== 'TRIAL') return null
  const days = trialDaysLeft(user.trialEndsAt ? new Date(user.trialEndsAt) : null, new Date(user.createdAt))
  if (days === 0) return <span className="text-xs font-semibold text-red-600">Expired</span>
  return <span className={`text-xs font-semibold ${days <= 3 ? 'text-amber-600' : 'text-slate-500'}`}>{days}d left</span>
}

function UsageBar({ used, total }: { used: number; total: number }) {
  if (total >= 999999) return <span className="text-xs text-violet-600 font-semibold">∞</span>
  const pct = Math.min(100, (used / total) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500">{used}/{total}</span>
    </div>
  )
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return m <= 1 ? 'Just now' : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [failed, setFailed] = useState<FailedInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'trial' | 'expired' | 'paid' | 'sales'>('all')
  const [acting, setActing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'failed'>('users')

  async function load() {
    const res = await fetch('/api/admin/users')
    if (res.status === 403) { toast.error('Admin access required'); return }
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    fetch('/api/admin/failed').then(r => r.json()).then(setFailed).catch(() => {})
  }, [])

  async function doAction(userId: string, action: string, value?: number | string, label?: string) {
    setActing(`${userId}-${action}`)
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(label ?? 'Updated')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setActing(null)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.includes(search) || (u.name ?? '').toLowerCase().includes(search.toLowerCase()) || (u.businessName ?? '').toLowerCase().includes(search.toLowerCase())
    const daysLeft = trialDaysLeft(u.trialEndsAt ? new Date(u.trialEndsAt) : null, new Date(u.createdAt))
    const matchFilter =
      filter === 'all' ? true :
      filter === 'trial' ? u.plan === 'TRIAL' && daysLeft > 0 :
      filter === 'expired' ? u.plan === 'TRIAL' && daysLeft === 0 :
      filter === 'paid' ? ['STARTER','GROWTH','PRO','ENTERPRISE'].includes(u.plan) :
      filter === 'sales' ? u.plan === 'SALES' : true
    return matchSearch && matchFilter
  })

  // Stats
  const total = users.length
  const onTrial = users.filter(u => u.plan === 'TRIAL' && trialDaysLeft(u.trialEndsAt ? new Date(u.trialEndsAt) : null, new Date(u.createdAt)) > 0).length
  const expired = users.filter(u => u.plan === 'TRIAL' && trialDaysLeft(u.trialEndsAt ? new Date(u.trialEndsAt) : null, new Date(u.createdAt)) === 0).length
  const paid = users.filter(u => ['STARTER','GROWTH','PRO','ENTERPRISE'].includes(u.plan)).length
  const sales = users.filter(u => u.plan === 'SALES').length
  const active = users.filter(u => u.lastActiveAt && Date.now() - new Date(u.lastActiveAt).getTime() < 7 * 86400_000).length

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-xl w-48" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}</div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + tabs */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage accounts, gift credits, run your sales motion</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
            Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('failed')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'failed' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
            {failed.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            Failed ({failed.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total users', value: total, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Active trial', value: onTrial, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Trial expired', value: expired, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', note: 'Hot leads' },
          { label: 'Paid', value: paid, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sales accounts', value: sales, icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Active 7d', value: active, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            {s.note && <div className={`text-xs font-semibold mt-0.5 ${s.color}`}>{s.note}</div>}
          </div>
        ))}
      </div>

      {/* Filters + search — users tab only */}
      {activeTab === 'failed' && null}
      <div className={`flex flex-col sm:flex-row gap-3 ${activeTab !== 'users' ? 'hidden' : ''}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or business…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all','trial','expired','paid','sales'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : f === 'trial' ? 'Active trial' : f === 'expired' ? '🔥 Expired' : f === 'paid' ? 'Paid' : 'Sales'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No users match this filter</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    {['User', 'Plan', 'Usage', 'Trial', 'Inspections', 'Last active', 'Signed up', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(u => {
                    const busy = (a: string) => acting === `${u.id}-${a}`
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 text-sm">{u.name || '—'}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                          {u.businessName && <div className="text-xs text-slate-500 mt-0.5">{u.businessName}</div>}
                        </td>
                        <td className="px-4 py-3.5"><PlanBadge plan={u.plan} /></td>
                        <td className="px-4 py-3.5"><UsageBar used={u.creditsUsed} total={u.creditsTotal} /></td>
                        <td className="px-4 py-3.5"><TrialStatus user={u} /></td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{u.inspectionCount}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{timeAgo(u.lastActiveAt)}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              title="Gift 20 credits"
                              disabled={!!acting}
                              onClick={() => doAction(u.id, 'gift_credits', 20, `Gifted 20 credits to ${u.email}`)}
                              className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                            >
                              <Gift className="w-3 h-3" />
                              {busy('gift_credits') ? '…' : '+20'}
                            </button>
                            <button
                              title="Extend trial 7 days"
                              disabled={!!acting}
                              onClick={() => doAction(u.id, 'extend_trial', 7, `Extended trial for ${u.email}`)}
                              className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                            >
                              <Clock className="w-3 h-3" />
                              {busy('extend_trial') ? '…' : '+7d'}
                            </button>
                            {u.plan !== 'SALES' ? (
                              <button title="Grant Sales account" disabled={!!acting}
                                onClick={() => doAction(u.id, 'set_plan', 'SALES', `${u.email} → SALES account`)}
                                className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                                <ShieldCheck className="w-3 h-3" />
                                {busy('set_plan') ? '…' : 'Sales'}
                              </button>
                            ) : (
                              <button title="Reset to trial" disabled={!!acting}
                                onClick={() => doAction(u.id, 'reset_trial', undefined, `Reset ${u.email} to trial`)}
                                className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                                <RotateCcw className="w-3 h-3" />
                                {busy('reset_trial') ? '…' : 'Reset'}
                              </button>
                            )}
                            {/* Block / Unblock */}
                            {u.isBlocked ? (
                              <button title="Unblock user" disabled={!!acting}
                                onClick={() => doAction(u.id, 'unblock', undefined, `Unblocked ${u.email}`)}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                                <RotateCcw className="w-3 h-3" />
                                {busy('unblock') ? '…' : 'Unblock'}
                              </button>
                            ) : (
                              <button title="Block user" disabled={!!acting}
                                onClick={() => { if (confirm(`Block ${u.email}?`)) doAction(u.id, 'block', undefined, `Blocked ${u.email}`) }}
                                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                                <Ban className="w-3 h-3" />
                                {busy('block') ? '…' : 'Block'}
                              </button>
                            )}
                            {/* View inspections */}
                            <Link href={`/admin/users/${u.id}`}
                              className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors">
                              <ExternalLink className="w-3 h-3" />
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filtered.map(u => {
                const busy = (a: string) => acting === `${u.id}-${a}`
                return (
                  <div key={u.id} className="p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{u.name || u.email}</div>
                        {u.name && <div className="text-xs text-slate-400 truncate">{u.email}</div>}
                        {u.businessName && (
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{u.businessName}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <PlanBadge plan={u.plan} />
                        <TrialStatus user={u} />
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 rounded-xl py-2 px-1">
                        <div className="text-sm font-bold text-slate-900">{u.inspectionCount}</div>
                        <div className="text-xs text-slate-400">Inspections</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl py-2 px-1">
                        <div className="text-sm font-bold text-slate-900">{u.vehicleCount}</div>
                        <div className="text-xs text-slate-400">Vehicles</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl py-2 px-1">
                        <div className="text-sm font-bold text-slate-900 truncate">{timeAgo(u.lastActiveAt)}</div>
                        <div className="text-xs text-slate-400">Last active</div>
                      </div>
                    </div>

                    {/* Usage */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Credits used</span>
                      <UsageBar used={u.creditsUsed} total={u.creditsTotal} />
                    </div>

                    {/* Signed up */}
                    <div className="text-xs text-slate-400">
                      Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap pt-1">
                      <button disabled={!!acting} onClick={() => doAction(u.id, 'gift_credits', 20, `Gifted 20 credits`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-semibold active:bg-teal-100 disabled:opacity-40 min-w-0">
                        <Gift className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{busy('gift_credits') ? '…' : '+20 credits'}</span>
                      </button>
                      <button disabled={!!acting} onClick={() => doAction(u.id, 'extend_trial', 7, `Extended trial`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold active:bg-amber-100 disabled:opacity-40 min-w-0">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{busy('extend_trial') ? '…' : '+7 days'}</span>
                      </button>
                      {u.plan !== 'SALES' ? (
                        <button disabled={!!acting} onClick={() => doAction(u.id, 'set_plan', 'SALES', `Granted SALES`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-50 text-violet-700 rounded-xl text-xs font-semibold active:bg-violet-100 disabled:opacity-40 min-w-0">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{busy('set_plan') ? '…' : 'Grant Sales'}</span>
                        </button>
                      ) : (
                        <button disabled={!!acting} onClick={() => doAction(u.id, 'reset_trial', undefined, `Reset to trial`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold active:bg-slate-200 disabled:opacity-40 min-w-0">
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{busy('reset_trial') ? '…' : 'Reset'}</span>
                        </button>
                      )}
                      {/* Block / View */}
                      {u.isBlocked ? (
                        <button disabled={!!acting} onClick={() => doAction(u.id, 'unblock', undefined, `Unblocked`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold disabled:opacity-40 min-w-0">
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          <span>{busy('unblock') ? '…' : 'Unblock'}</span>
                        </button>
                      ) : (
                        <button disabled={!!acting} onClick={() => { if (confirm(`Block ${u.email}?`)) doAction(u.id, 'block', undefined, `Blocked`) }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-semibold disabled:opacity-40 min-w-0">
                          <Ban className="w-3.5 h-3.5 shrink-0" />
                          <span>{busy('block') ? '…' : 'Block'}</span>
                        </button>
                      )}
                      <Link href={`/admin/users/${u.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold min-w-0">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>View</span>
                      </Link>
                    </div>

                    {/* Blocked badge */}
                    {u.isBlocked && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                        <Ban className="w-3 h-3" /> Account blocked
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Failed inspections tab */}
      {activeTab === 'failed' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {failed.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No failed or stuck inspections</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {failed.map(f => (
                <div key={f.id} className="p-4 flex items-start gap-4">
                  <div className={`shrink-0 mt-0.5 w-2.5 h-2.5 rounded-full ${f.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-slate-900 truncate">{f.vehicle} · {f.licensePlate}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {f.status === 'IN_PROGRESS' ? 'Stuck in progress' : 'Upload abandoned'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {f.userEmail} · {f.imageCount} photos · stuck {f.stuckFor}m ago
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{f.type.replace(/_/g, ' ')} · Created {new Date(f.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Link href={`/inspections/${f.id}`}
                    className="shrink-0 text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Only visible to admin accounts configured via <code className="bg-slate-100 px-1 py-0.5 rounded">ADMIN_EMAIL</code> env var
      </p>
    </div>
  )
}
