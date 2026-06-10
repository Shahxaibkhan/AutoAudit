'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { inspectionTypeLabel, isSingleInspection } from '@/lib/utils'
import { useSession } from 'next-auth/react'

/* ── Type groups ─────────────────────────────────────────────────────── */
const SINGLE_TYPES = [
  { type: 'JUST_CHECK',       label: 'Just check a car',   desc: 'Quick condition check',        emoji: '🔍' },
  { type: 'BUYER_INSPECTION', label: 'Buying a used car',  desc: 'Pre-purchase report',          emoji: '🛒' },
  { type: 'SELLER_INSPECTION',label: 'Selling my car',     desc: 'Condition disclosure report',  emoji: '🏷️' },
  { type: 'MY_CAR',           label: 'My own car',         desc: 'Routine health check',         emoji: '🚗' },
]

const B2B_TYPES = [
  'PRE_RENTAL', 'POST_RENTAL',
  'PRE_SALE',   'POST_SALE',
  'SHIFT_START','SHIFT_END',
  'PRE_CLAIM',  'POST_CLAIM',
  'PRE_REPAIR', 'POST_REPAIR',
  'LEASE_START','LEASE_END',
]

const AFTER_TYPES: Record<string, string> = {
  POST_RENTAL: 'PRE_RENTAL', POST_SALE: 'PRE_SALE',
  SHIFT_END:   'SHIFT_START', POST_CLAIM: 'PRE_CLAIM',
  POST_REPAIR: 'PRE_REPAIR',  LEASE_END:  'LEASE_START',
}

interface Vehicle { id: string; make: string; model: string; year: number; licensePlate: string }
interface Inspection { id: string; type: string; status: string; createdAt: string }

function RadioCard({ type, selected, onChange }: { type: string; selected: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all text-sm ${
      selected ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold' : 'border-slate-200 hover:border-slate-300 text-slate-600'
    }`}>
      <input type="radio" name="type" value={type} checked={selected} onChange={onChange} className="hidden" />
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-teal-500' : 'border-slate-300'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
      </div>
      {inspectionTypeLabel(type)}
    </label>
  )
}

// Individual accounts hide B2B comparison types
const CONSUMER_INDUSTRIES = ['individual', 'buyer', 'seller', 'my_car']

function NewInspectionForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session } = useSession()
  const userIndustry = (session?.user as any)?.industry as string | null
  const isConsumer = userIndustry ? CONSUMER_INDUSTRIES.includes(userIndustry) : false

  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [preInspections, setPreInspections] = useState<Inspection[]>([])
  const [showB2B, setShowB2B] = useState(false)
  const [form, setForm] = useState({
    vehicleId: params.get('vehicleId') || '',
    type: 'JUST_CHECK',
    renterName: '', renterPhone: '', renterEmail: '',
    rentalStart: '', rentalEnd: '',
    preInspectionId: '', notes: '',
  })

  useEffect(() => {
    fetch('/api/vehicles').then(r => r.json()).then(setVehicles)
  }, [])

  // Auto-expand B2B section if a B2B type is selected
  useEffect(() => {
    if (B2B_TYPES.includes(form.type)) setShowB2B(true)
  }, [form.type])

  const linkedPreType = AFTER_TYPES[form.type]
  const isB2C = isSingleInspection(form.type)

  useEffect(() => {
    if (form.vehicleId && linkedPreType) {
      fetch(`/api/inspections?vehicleId=${form.vehicleId}&type=${linkedPreType}`)
        .then(r => r.json())
        .then((all: Inspection[]) => {
          const completed = all.filter(i => i.status === 'COMPLETED' ||
            i.status === 'LOCKED' || i.status === 'PENDING_CUSTOMER_REVIEW')
          setPreInspections(completed)
          // Auto-select the most recent one
          if (completed.length > 0) {
            setForm(prev => ({ ...prev, preInspectionId: completed[0].id }))
          }
        })
        .catch(() => setPreInspections([]))
    } else {
      setPreInspections([])
      setForm(prev => ({ ...prev, preInspectionId: '' }))
    }
  }, [form.vehicleId, form.type, linkedPreType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vehicleId) return toast.error('Please select a vehicle')
    setLoading(true)
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Inspection created!')
      router.push(`/inspections/${data.id}/capture`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/inspections" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Inspection</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-powered vehicle inspection in 60 seconds</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vehicle *</label>
              <select required value={form.vehicleId} onChange={f('vehicleId')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select a vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year}) — {v.licensePlate}</option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">No vehicles found. <Link href="/vehicles/new" className="text-teal-600 hover:underline">Add one first</Link></p>
              )}
            </div>

            {/* Inspection type — grouped */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">What are you inspecting for? *</label>

              {/* Group 1: Single Inspection */}
              <div className="mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Single Inspection</p>
                <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                  {SINGLE_TYPES.map(({ type, label, desc, emoji }) => (
                    <label key={type}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        form.type === type ? 'border-teal-500 bg-white shadow-sm' : 'border-transparent hover:bg-white hover:border-slate-200'
                      }`}>
                      <input type="radio" name="type" value={type} checked={form.type === type}
                        onChange={() => setForm(p => ({ ...p, type }))} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.type === type ? 'border-teal-500' : 'border-slate-300'}`}>
                        {form.type === type && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                      </div>
                      <span className="text-lg leading-none">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${form.type === type ? 'text-teal-800' : 'text-slate-700'}`}>{label}</div>
                        <div className="text-xs text-slate-400">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group 2: Before & After — hidden for consumers, collapsible for businesses */}
              {!isConsumer && <div>
                <button
                  type="button"
                  onClick={() => setShowB2B(s => !s)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 hover:text-slate-600 transition-colors"
                >
                  <span>Before &amp; After Comparison</span>
                  <span className={`transition-transform duration-200 ${showB2B ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showB2B && (
                  <div className="bg-slate-50 rounded-2xl p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {B2B_TYPES.map(type => (
                        <RadioCard key={type} type={type} selected={form.type === type}
                          onChange={() => setForm(p => ({ ...p, type }))} />
                      ))}
                    </div>
                  </div>
                )}
                {!showB2B && (
                  <p className="text-xs text-slate-400 mt-1">
                    For rental, fleet, and dealership workflows —{' '}
                    <button type="button" onClick={() => setShowB2B(true)} className="text-teal-600 hover:underline font-medium">
                      show options
                    </button>
                  </p>
                )}
              </div>}
            </div>

            {linkedPreType && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Link to {inspectionTypeLabel(linkedPreType)} inspection
                </label>
                <select value={form.preInspectionId} onChange={f('preInspectionId')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="">Select previous inspection (optional)</option>
                  {preInspections.map(i => (
                    <option key={i.id} value={i.id}>
                      {new Date(i.createdAt).toLocaleDateString()} — {i.status}
                    </option>
                  ))}
                </select>
                {preInspections.length === 0 && form.vehicleId && (
                  <p className="text-xs text-amber-600 mt-1">No completed {inspectionTypeLabel(linkedPreType).toLowerCase()} inspections found for this vehicle.</p>
                )}
              </div>
            )}

            {/* Party details — B2B only */}
            {!isB2C && (
              <>
                <hr className="border-slate-100" />
                <p className="text-sm font-bold text-slate-700">Party Details <span className="font-normal text-slate-400">(optional)</span></p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                    <input type="text" value={form.renterName} onChange={f('renterName')}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ali Hassan" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                    <input type="tel" value={form.renterPhone} onChange={f('renterPhone')}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+1 234 567 8900" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                    <input type="datetime-local" value={form.rentalStart} onChange={f('rentalStart')}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                    <input type="datetime-local" value={form.rentalEnd} onChange={f('rentalEnd')}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea value={form.notes} onChange={f('notes')} rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Any notes about this inspection..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-lg shadow-teal-500/20">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create & Start Capture
              </button>
              <Link href="/inspections" className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewInspectionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    }>
      <NewInspectionForm />
    </Suspense>
  )
}
