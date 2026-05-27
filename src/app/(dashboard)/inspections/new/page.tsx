'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { inspectionTypeLabel } from '@/lib/utils'

const INSPECTION_TYPES = [
  'PRE_RENTAL', 'POST_RENTAL',
  'PRE_SALE', 'POST_SALE',
  'SHIFT_START', 'SHIFT_END',
  'PRE_CLAIM', 'POST_CLAIM',
  'PRE_REPAIR', 'POST_REPAIR',
  'LEASE_START', 'LEASE_END',
]

const AFTER_TYPES: Record<string, string> = {
  POST_RENTAL: 'PRE_RENTAL',
  POST_SALE: 'PRE_SALE',
  SHIFT_END: 'SHIFT_START',
  POST_CLAIM: 'PRE_CLAIM',
  POST_REPAIR: 'PRE_REPAIR',
  LEASE_END: 'LEASE_START',
}

interface Vehicle { id: string; make: string; model: string; year: number; licensePlate: string }
interface Inspection { id: string; type: string; status: string; createdAt: string }

function NewInspectionForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [preInspections, setPreInspections] = useState<Inspection[]>([])
  const [form, setForm] = useState({
    vehicleId: params.get('vehicleId') || '',
    type: 'PRE_RENTAL',
    renterName: '', renterPhone: '', renterEmail: '',
    rentalStart: '', rentalEnd: '',
    preInspectionId: '', notes: '',
  })

  useEffect(() => {
    fetch('/api/vehicles').then(r => r.json()).then(setVehicles)
  }, [])

  const linkedPreType = AFTER_TYPES[form.type]

  useEffect(() => {
    if (form.vehicleId && linkedPreType) {
      fetch(`/api/inspections?vehicleId=${form.vehicleId}&type=${linkedPreType}`)
        .then(r => r.json())
        .then((all: Inspection[]) => setPreInspections(all.filter(i => i.status === 'COMPLETED')))
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
          <p className="text-slate-400 text-sm mt-0.5">Create an inspection for any vehicle type or workflow</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vehicle *</label>
              <select
                required value={form.vehicleId} onChange={f('vehicleId')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year}) — {v.licensePlate}</option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">No vehicles found. <Link href="/vehicles/new" className="text-teal-600 hover:underline">Add one first</Link></p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Inspection Type *</label>
              <div className="grid grid-cols-2 gap-2.5">
                {INSPECTION_TYPES.map(type => (
                  <label key={type} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all text-sm ${
                    form.type === type
                      ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}>
                    <input type="radio" name="type" value={type} checked={form.type === type} onChange={f('type')} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.type === type ? 'border-teal-500' : 'border-slate-300'}`}>
                      {form.type === type && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                    </div>
                    {inspectionTypeLabel(type)}
                  </label>
                ))}
              </div>
            </div>

            {linkedPreType && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Link to {inspectionTypeLabel(linkedPreType)} inspection
                </label>
                <select
                  value={form.preInspectionId} onChange={f('preInspectionId')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
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

            <hr className="border-slate-100" />
            <p className="text-sm font-bold text-slate-700">Party Details (optional)</p>

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
                  placeholder="+92 300 1234567" />
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={f('notes')} rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Any notes about this inspection..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-lg shadow-teal-500/20"
              >
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
