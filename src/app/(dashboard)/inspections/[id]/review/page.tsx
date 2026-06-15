'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, CheckCircle, XCircle, Edit2, Plus, ChevronDown, ChevronUp,
  Loader2, Sparkles, Send, AlertTriangle, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import { SINGLE_INSPECTION_TYPES } from '@/lib/utils'

interface Damage {
  id: string; type: string; severity: string; panelCode: string | null
  location: string; description: string; imageUrl: string | null
  verificationState: string; ownerNote: string | null
  confidence: number | null; estimatedCost: number | null
  isVisibleInFinal: boolean
}
interface ReviewData {
  inspection: {
    id: string; type: string; status: string
    vehicle: { make: string; model: string; year: number; licensePlate: string }
    ownerSignedAt: string | null; shareToken: string | null
  }
  damages: { severe: Damage[]; moderate: Damage[]; minor: Damage[] }
  summary: { total: number; severe: number; moderate: number; minor: number; confirmed: number }
}

function severityDot(s: string) {
  return s === 'severe' ? 'bg-red-500' : s === 'moderate' ? 'bg-amber-400' : 'bg-emerald-400'
}
function stateBadge(state: string) {
  const m: Record<string, string> = {
    AI_DETECTED: 'bg-slate-100 text-slate-500',
    OWNER_CONFIRMED: 'bg-emerald-100 text-emerald-700',
    OWNER_EDITED: 'bg-blue-100 text-blue-700',
    OWNER_REMOVED: 'bg-red-100 text-red-600',
    OWNER_ADDED: 'bg-purple-100 text-purple-700',
  }
  const label: Record<string, string> = {
    AI_DETECTED: 'Needs review', OWNER_CONFIRMED: 'Confirmed',
    OWNER_EDITED: 'Edited', OWNER_REMOVED: 'Removed', OWNER_ADDED: 'Added by you',
  }
  return { cls: m[state] ?? 'bg-slate-100 text-slate-500', label: label[state] ?? state }
}

function DamageCard({ damage, onAction, acting }: {
  damage: Damage
  onAction: (id: string, action: string, data?: Record<string, string>) => Promise<void>
  acting: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editDesc, setEditDesc] = useState(damage.description)
  const [editSev, setEditSev] = useState(damage.severity)

  const badge = stateBadge(damage.verificationState)

  return (
    <div className={`bg-white rounded-2xl border p-4 space-y-3 transition-opacity ${damage.verificationState === 'OWNER_REMOVED' ? 'opacity-40' : ''} ${damage.verificationState === 'OWNER_CONFIRMED' ? 'border-emerald-200' : damage.verificationState === 'OWNER_REMOVED' ? 'border-red-100' : 'border-slate-200'}`}>
      <div className="flex gap-3">
        {damage.imageUrl && (
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
            <Image src={damage.imageUrl} alt={damage.type} fill className="object-cover" sizes="80px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${severityDot(damage.severity)}`} />
            <span className="text-xs font-semibold text-slate-700 capitalize">{damage.type.replace(/_/g, ' ')}</span>
            <span className="text-xs text-slate-400">{damage.panelCode?.replace(/_/g, ' ')}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
            {damage.confidence && <span className="text-xs text-slate-400">AI: {Math.round(damage.confidence * 100)}%</span>}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{damage.description}</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <select value={editSev} onChange={e => setEditSev(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500">
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
          <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" />
          <div className="flex gap-2">
            <button onClick={() => onAction(damage.id, 'edit', { description: editDesc, severity: editSev })}
              disabled={acting}
              className="flex-1 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50">
              Save edit
            </button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-slate-200 text-xs text-slate-600 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          {damage.verificationState !== 'OWNER_REMOVED' && (
            <>
              <button onClick={() => onAction(damage.id, 'confirm')} disabled={acting}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${damage.verificationState === 'OWNER_CONFIRMED' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                <CheckCircle className="w-3.5 h-3.5" /> Confirm
              </button>
              <button onClick={() => setEditing(true)} disabled={acting}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </>
          )}
          <button onClick={() => onAction(damage.id, damage.verificationState === 'OWNER_REMOVED' ? 'confirm' : 'remove')}
            disabled={acting}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${damage.verificationState === 'OWNER_REMOVED' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
            <XCircle className="w-3.5 h-3.5" />
            {damage.verificationState === 'OWNER_REMOVED' ? 'Restore' : 'Remove'}
          </button>
        </div>
      )}
    </div>
  )
}

function SeveritySection({ label, color, damages, inspectionId, onAction, acting, defaultExpanded }: {
  label: string; color: string; damages: Damage[]; inspectionId: string
  onAction: (id: string, action: string, data?: Record<string, string>) => Promise<void>
  acting: boolean; defaultExpanded: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [bulkActing, setBulkActing] = useState(false)
  const severity = damages[0]?.severity ?? 'minor'
  const unreviewed = damages.filter(d => d.verificationState === 'AI_DETECTED').length

  async function bulkAction(action: 'confirm' | 'remove') {
    setBulkActing(true)
    try {
      const res = await fetch(`/api/inspections/${inspectionId}/bulk-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity, action }),
      })
      if (!res.ok) throw new Error()
      toast.success(`All ${severity} damages ${action === 'confirm' ? 'confirmed' : 'removed'}`)
      window.location.reload()
    } catch { toast.error('Failed') } finally { setBulkActing(false) }
  }

  if (damages.length === 0) return null

  const previewImages = damages.slice(0, 4).filter(d => d.imageUrl)

  return (
    <div className="space-y-3">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${color}`} />
          <span className="font-bold text-slate-900 capitalize">{label}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{damages.length}</span>
          {unreviewed > 0 && <span className="text-xs text-amber-600 font-medium">{unreviewed} need review</span>}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {!expanded && damages.length > 0 && (
        <div className="flex items-center gap-3 pb-2">
          <div className="flex gap-1">
            {previewImages.map(d => (
              <div key={d.id} className="w-12 h-8 rounded-md overflow-hidden bg-slate-100 relative">
                <Image src={d.imageUrl!} alt="" fill className="object-cover" sizes="48px" />
              </div>
            ))}
            {damages.length - previewImages.length > 0 && (
              <div className="w-12 h-8 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium">
                +{damages.length - previewImages.length}
              </div>
            )}
          </div>
          {unreviewed > 0 && (
            <div className="flex gap-2 ml-auto">
              <button onClick={() => bulkAction('confirm')} disabled={bulkActing}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100 disabled:opacity-50">
                ✓ Confirm all {damages.length}
              </button>
              <button onClick={() => setExpanded(true)}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200">
                Review ▼
              </button>
            </div>
          )}
        </div>
      )}

      {expanded && (
        <div className="space-y-3">
          {damages.map(d => (
            <DamageCard key={d.id} damage={d} onAction={onAction} acting={acting} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OwnerReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [signing, setSigning] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDamage, setNewDamage] = useState({ type: 'scratch', severity: 'minor', panelCode: 'other', description: '' })

  const load = useCallback(async () => {
    const res = await fetch(`/api/inspections/${params.id}/review`)
    if (!res.ok) { toast.error('Failed to load'); return }
    const d = await res.json()
    setData(d)
    setLoading(false)
    if (d.inspection.shareToken) {
      setShareUrl(`${window.location.origin}/review/${d.inspection.shareToken}`)
    }
  }, [params.id])

  useEffect(() => { load() }, [load])

  async function handleAction(damageId: string, action: string, extra?: Record<string, string>) {
    setActing(true)
    try {
      const res = await fetch(`/api/inspections/${params.id}/damages/${damageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (!res.ok) throw new Error()
      await load()
      toast.success(action === 'confirm' ? 'Confirmed' : action === 'remove' ? 'Removed' : 'Updated')
    } catch { toast.error('Action failed') } finally { setActing(false) }
  }

  async function handleAddDamage() {
    if (!newDamage.description.trim()) return toast.error('Add a description')
    setActing(true)
    try {
      const res = await fetch(`/api/inspections/${params.id}/damages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDamage),
      })
      if (!res.ok) throw new Error()
      await load()
      setNewDamage({ type: 'scratch', severity: 'minor', panelCode: 'other', description: '' })
      setShowAddForm(false)
      toast.success('Damage added')
    } catch { toast.error('Failed to add') } finally { setActing(false) }
  }

  async function handleSign() {
    setSigning(true)
    try {
      const res = await fetch(`/api/inspections/${params.id}/owner-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      if (d.completed) {
        toast.success('Inspection complete!')
        router.push(`/inspections/${params.id}/report`)
        return
      }
      setShareUrl(d.shareUrl)
      await load()
      toast.success('Signed! Share the link with your customer.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signing failed')
    } finally { setSigning(false) }
  }

  function copyLink() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  )
  if (!data) return <div className="text-center py-24 text-slate-400">Inspection not found</div>

  const { inspection, damages, summary } = data
  const allDamages = [...damages.severe, ...damages.moderate, ...damages.minor]
  const isSigned = !!inspection.ownerSignedAt
  const isSingleParty = SINGLE_INSPECTION_TYPES.includes(inspection.type)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/inspections/${params.id}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900">Review Findings</h1>
          <p className="text-slate-400 text-sm">
            {inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year} · {inspection.vehicle.licensePlate}
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          AI found <strong>{summary.total}</strong> potential damages. Review and confirm before completing.
        </p>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{summary.severe} severe</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />{summary.moderate} moderate</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />{summary.minor} minor</span>
        </div>
      </div>

      {/* Share link (after signing — B2B only) */}
      {isSigned && shareUrl && !isSingleParty && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800">You've signed this inspection</p>
              <p className="text-xs text-emerald-700 mt-0.5">Share the link below with your customer for their review.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input readOnly value={shareUrl}
              className="flex-1 text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-600 min-w-0" />
            <button onClick={copyLink}
              className="px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shrink-0">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <a href={`https://wa.me/?text=${encodeURIComponent(`Please review the vehicle inspection report: ${shareUrl}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#25D366] font-semibold hover:underline">
            <Send className="w-3 h-3" /> Send via WhatsApp
          </a>
        </div>
      )}

      {/* Damage sections */}
      {!isSigned && (
        <div className="space-y-4">
          {allDamages.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-bold text-emerald-800 text-lg mb-1">Clean condition — no damage found</h3>
              <p className="text-emerald-700 text-sm leading-relaxed mb-4">
                The AI inspected all frames and found no damage, scratches, dents, or defects. This vehicle appears to be in excellent condition.
              </p>
              <p className="text-emerald-600 text-xs">{isSingleParty ? 'Complete the inspection below to generate your report.' : 'Sign below to share this clean report with your customer.'}</p>
            </div>
          ) : (
            <>
              <SeveritySection label="Severe" color="bg-red-500"
                damages={damages.severe} inspectionId={params.id} onAction={handleAction} acting={acting} defaultExpanded={true} />
              <SeveritySection label="Moderate" color="bg-amber-400"
                damages={damages.moderate} inspectionId={params.id} onAction={handleAction} acting={acting} defaultExpanded={false} />
              <SeveritySection label="Minor" color="bg-emerald-400"
                damages={damages.minor} inspectionId={params.id} onAction={handleAction} acting={acting} defaultExpanded={false} />
            </>
          )}
        </div>
      )}

      {/* Reviewed damages list (after signing) */}
      {isSigned && allDamages.filter(d => d.verificationState !== 'OWNER_REMOVED').length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-700">Confirmed damages ({allDamages.filter(d => d.isVisibleInFinal).length})</p>
          {allDamages.filter(d => d.isVisibleInFinal).map(d => {
            const b = stateBadge(d.verificationState)
            return (
              <div key={d.id} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-100">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${severityDot(d.severity)}`} />
                <div className="min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.cls}`}>{b.label}</span>
                  <span className="text-xs text-slate-500 ml-2 capitalize">{d.type.replace(/_/g, ' ')}</span>
                  <p className="text-xs text-slate-600 mt-0.5">{d.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add damage */}
      {!isSigned && (
        <div>
          {showAddForm ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-bold text-slate-900">Add a damage AI missed</p>
              <div className="grid grid-cols-2 gap-3">
                <select value={newDamage.type} onChange={e => setNewDamage(p => ({ ...p, type: e.target.value }))}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {['scratch','dent','crack','paint_chip','rust','broken','missing','rim_damage','repaint','other'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <select value={newDamage.severity} onChange={e => setNewDamage(p => ({ ...p, severity: e.target.value }))}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <textarea value={newDamage.description} onChange={e => setNewDamage(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe the damage..." rows={2}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              <div className="flex gap-2">
                <button onClick={handleAddDamage} disabled={acting}
                  className="flex-1 py-2 bg-teal-500 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                  {acting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add Damage'}
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 text-sm text-slate-600 rounded-xl">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium">
              <Plus className="w-4 h-4" /> Add damage AI missed
            </button>
          )}
        </div>
      )}

      {/* Sign / complete button */}
      {!isSigned && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">
                {isSingleParty ? 'Ready to complete?' : 'Ready to send to customer?'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Unreviewed damages will be auto-confirmed. You can still view but not edit after this.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1 mb-4">
            <p>✓ Confirmed: <strong>{allDamages.filter(d => d.verificationState === 'OWNER_CONFIRMED' || d.verificationState === 'OWNER_EDITED').length}</strong></p>
            <p>✏️ Edited: <strong>{allDamages.filter(d => d.verificationState === 'OWNER_EDITED').length}</strong></p>
            <p>✗ Removed: <strong>{allDamages.filter(d => d.verificationState === 'OWNER_REMOVED').length}</strong></p>
            <p>➕ Added: <strong>{allDamages.filter(d => d.verificationState === 'OWNER_ADDED').length}</strong></p>
          </div>
          <button onClick={handleSign} disabled={signing}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-lg shadow-teal-500/20">
            {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {signing ? (isSingleParty ? 'Completing…' : 'Signing…') : (isSingleParty ? 'Complete Inspection →' : 'Sign & Send to Customer →')}
          </button>
        </div>
      )}
    </div>
  )
}
