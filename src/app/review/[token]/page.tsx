'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckCircle, XCircle, Loader2, AlertTriangle, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Damage {
  id: string; type: string; severity: string; panelCode: string | null
  location: string; description: string; imageUrl: string | null
  verificationState: string; ownerNote: string | null
}
interface ReviewData {
  inspection: {
    id: string; type: string; status: string
    vehicle: { make: string; model: string; year: number; licensePlate: string; color: string }
    renterName: string | null; ownerSignedAt: string | null; ownerPhone: string | null
  }
  damages: { severe: Damage[]; moderate: Damage[]; minor: Damage[] }
  summary: { total: number; severe: number; moderate: number; minor: number }
}

function severityDot(s: string) {
  return s === 'severe' ? 'bg-red-500' : s === 'moderate' ? 'bg-amber-400' : 'bg-emerald-400'
}

function CustomerDamageCard({ damage, token, onUpdate }: {
  damage: Damage; token: string; onUpdate: () => void
}) {
  const [acting, setActing] = useState(false)
  const [disputed, setDisputed] = useState(false)
  const [note, setNote] = useState('')

  const isAgreed = damage.verificationState === 'CUSTOMER_CONFIRMED'
  const isDisputed = damage.verificationState === 'CUSTOMER_DISPUTED'

  async function action(act: 'agree' | 'dispute') {
    setActing(true)
    try {
      const res = await fetch(`/api/public/review/${token}/damages/${damage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, note: act === 'dispute' ? note : undefined }),
      })
      if (!res.ok) throw new Error()
      onUpdate()
      if (act === 'agree') toast.success('Agreed')
      else toast.success('Dispute noted')
      setDisputed(false)
    } catch { toast.error('Failed') } finally { setActing(false) }
  }

  return (
    <div className={`bg-white rounded-2xl border p-4 space-y-3 ${isAgreed ? 'border-emerald-200' : isDisputed ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex gap-3">
        {damage.imageUrl && (
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
            <Image src={damage.imageUrl} alt={damage.type} fill className="object-cover" sizes="80px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${severityDot(damage.severity)}`} />
            <span className="text-xs font-semibold text-slate-700 capitalize">{damage.severity}</span>
            <span className="text-xs text-slate-500 capitalize">{damage.type.replace(/_/g, ' ')}</span>
            <span className="text-xs text-slate-400">{damage.panelCode?.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-xs text-slate-600">{damage.description}</p>
          {damage.ownerNote && <p className="text-xs text-slate-400 italic mt-1">Owner note: {damage.ownerNote}</p>}
        </div>
      </div>

      {isAgreed && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
          <CheckCircle className="w-3.5 h-3.5" /> You agreed with this finding
        </div>
      )}
      {isDisputed && (
        <div className="flex items-center gap-2 text-xs text-red-600 font-semibold">
          <XCircle className="w-3.5 h-3.5" /> You disputed this finding
        </div>
      )}

      {!isAgreed && !isDisputed && !disputed && (
        <div className="flex gap-2">
          <button onClick={() => action('agree')} disabled={acting}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
            <CheckCircle className="w-3.5 h-3.5" /> Agree
          </button>
          <button onClick={() => setDisputed(true)} disabled={acting}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
            <XCircle className="w-3.5 h-3.5" /> Dispute
          </button>
        </div>
      )}

      {disputed && (
        <div className="space-y-2">
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Why do you dispute this? (optional)"
            className="w-full text-xs border border-red-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none" />
          <div className="flex gap-2">
            <button onClick={() => action('dispute')} disabled={acting}
              className="flex-1 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50">
              Confirm dispute
            </button>
            <button onClick={() => setDisputed(false)} className="px-3 py-2 border border-slate-200 text-xs text-slate-600 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CustomerSeveritySection({ label, color, damages, token, onUpdate, defaultExpanded }: {
  label: string; color: string; damages: Damage[]; token: string; onUpdate: () => void; defaultExpanded: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  if (damages.length === 0) return null
  return (
    <div className="space-y-3">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${color}`} />
          <span className="font-bold text-slate-900 capitalize">{label}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{damages.length}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="space-y-3">
          {damages.map(d => <CustomerDamageCard key={d.id} damage={d} token={token} onUpdate={onUpdate} />)}
        </div>
      )}
    </div>
  )
}

export default function CustomerReviewPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [hash, setHash] = useState('')
  const [started, setStarted] = useState(false)

  async function load() {
    const res = await fetch(`/api/public/review/${params.token}`)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Link not found')
      setLoading(false)
      return
    }
    setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSign() {
    setSigning(true)
    try {
      const res = await fetch(`/api/public/review/${params.token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setHash(d.verificationHash)
      setSigned(true)
      toast.success('Inspection signed and locked!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signing failed')
    } finally { setSigning(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Link unavailable</h1>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    </div>
  )

  if (!data) return null

  const { inspection, damages, summary } = data
  const allDamages = [...damages.severe, ...damages.moderate, ...damages.minor]

  if (signed) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Inspection Locked</h1>
        <p className="text-slate-500 text-sm mb-5">Both parties have signed. The report is now tamper-proof.</p>
        <div className="bg-slate-900 rounded-xl p-4 text-left mb-5">
          <p className="text-xs text-slate-400 mb-1">SHA-256 Verification Hash</p>
          <p className="text-xs text-teal-400 font-mono break-all">{hash}</p>
        </div>
        <Link href="/" className="text-sm text-teal-600 hover:underline font-medium">← Back to AutoAuditAI</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">A</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">AutoAuditAI — Vehicle Inspection Review</p>
            <p className="text-sm font-bold text-slate-900">
              {inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year} · {inspection.vehicle.licensePlate}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {!started ? (
          /* Intro screen */
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
            <div className="text-3xl mb-4">🔍</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Vehicle Inspection Review</h2>
            <p className="text-slate-500 text-sm mb-5">
              {inspection.renterName ?? 'The owner'} has sent you an inspection report for the{' '}
              <strong>{inspection.vehicle.make} {inspection.vehicle.model}</strong>.
              Please review each finding and confirm or dispute.
            </p>
            <div className="flex gap-6 justify-center text-sm mb-6">
              <div className="text-center">
                <div className="text-2xl font-black text-red-600">{summary.severe}</div>
                <div className="text-xs text-slate-400">Severe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-500">{summary.moderate}</div>
                <div className="text-xs text-slate-400">Moderate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-600">{summary.minor}</div>
                <div className="text-xs text-slate-400">Minor</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-5">Review takes about 2-3 minutes. Your signature protects both parties.</p>
            <button onClick={() => setStarted(true)}
              className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20">
              Begin Review →
            </button>
          </div>
        ) : (
          <>
            {/* Damage sections */}
            <CustomerSeveritySection label="Severe" color="bg-red-500"
              damages={damages.severe} token={params.token} onUpdate={load} defaultExpanded={true} />
            <CustomerSeveritySection label="Moderate" color="bg-amber-400"
              damages={damages.moderate} token={params.token} onUpdate={load} defaultExpanded={true} />
            <CustomerSeveritySection label="Minor" color="bg-emerald-400"
              damages={damages.minor} token={params.token} onUpdate={load} defaultExpanded={false} />

            {/* Sign button */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <p>✓ Agreed: <strong>{allDamages.filter(d => d.verificationState === 'CUSTOMER_CONFIRMED').length}</strong></p>
                <p>✗ Disputed: <strong>{allDamages.filter(d => d.verificationState === 'CUSTOMER_DISPUTED').length}</strong></p>
                <p>Pending: <strong>{allDamages.filter(d => !['CUSTOMER_CONFIRMED','CUSTOMER_DISPUTED'].includes(d.verificationState)).length}</strong> (will be auto-agreed)</p>
              </div>
              <button onClick={handleSign} disabled={signing}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-lg shadow-teal-500/20">
                {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {signing ? 'Signing…' : 'Sign & Lock Report'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                This generates a tamper-proof SHA-256 hash of the agreed findings.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
