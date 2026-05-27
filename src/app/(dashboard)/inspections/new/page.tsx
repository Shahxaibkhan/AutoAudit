'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Vehicle { id: string; make: string; model: string; year: number; licensePlate: string }
interface Inspection { id: string; type: string; status: string; createdAt: string }

export default function NewInspectionPage() {
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

  useEffect(() => {
    if (form.vehicleId && form.type === 'POST_RENTAL') {
      fetch(`/api/inspections?vehicleId=${form.vehicleId}&type=PRE_RENTAL`)
        .then(r => r.json())
        .then((all: Inspection[]) => setPreInspections(all.filter(i => i.status === 'COMPLETED')))
        .catch(() => setPreInspections([]))
    } else {
      setPreInspections([])
    }
  }, [form.vehicleId, form.type])

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
        <Link href="/inspections" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Inspection</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create a pre or post-rental inspection</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle *</label>
              <select
                required value={form.vehicleId} onChange={f('vehicleId')}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year}) — {v.licensePlate}</option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No vehicles found. <Link href="/vehicles/new" className="text-blue-600 hover:underline">Add one first</Link></p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspection Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['PRE_RENTAL', 'POST_RENTAL'] as const).map(type => (
                  <label key={type} className={`flex items-center gap-3 p-3.5 border-2 rounded-lg cursor-pointer transition-colors ${
                    form.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="type" value={type} checked={form.type === type} onChange={f('type')} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.type === type ? 'border-blue-500' : 'border-gray-300'}`}>
                      {form.type === type && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.type === 'POST_RENTAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to Pre-Rental Inspection</label>
                <select
                  value={form.preInspectionId} onChange={f('preInspectionId')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select pre-rental inspection (optional)</option>
                  {preInspections.map(i => (
                    <option key={i.id} value={i.id}>
                      {new Date(i.createdAt).toLocaleDateString()} — {i.status}
                    </option>
                  ))}
                </select>
                {preInspections.length === 0 && form.vehicleId && (
                  <p className="text-xs text-amber-600 mt-1">No completed pre-rental inspections found for this vehicle.</p>
                )}
              </div>
            )}

            <hr className="border-gray-100" />
            <p className="text-sm font-semibold text-gray-700">Renter Details (optional)</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Renter Name</label>
                <input type="text" value={form.renterName} onChange={f('renterName')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ali Hassan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Renter Phone</label>
                <input type="tel" value={form.renterPhone} onChange={f('renterPhone')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+92 300 1234567" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rental Start</label>
                <input type="datetime-local" value={form.rentalStart} onChange={f('rentalStart')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rental End</label>
                <input type="datetime-local" value={form.rentalEnd} onChange={f('rentalEnd')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={f('notes')} rows={2}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any notes about this inspection..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create & Start Capture
              </button>
              <Link href="/inspections" className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
