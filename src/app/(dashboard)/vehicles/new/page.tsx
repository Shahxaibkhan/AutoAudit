'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CAR_MAKES = ['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'Kia', 'Nissan', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Other']

export default function NewVehiclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    make: '', model: '', year: new Date().getFullYear().toString(),
    licensePlate: '', color: '', vin: '', notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Vehicle added successfully')
      router.push('/vehicles')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white'
  const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5'

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/vehicles" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Vehicle</h1>
          <p className="text-slate-400 text-sm mt-0.5">Add a vehicle to your fleet</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Make *</label>
                <select required value={form.make} onChange={f('make')} className={inputCls}>
                  <option value="">Select make</option>
                  {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Model *</label>
                <input type="text" required value={form.model} onChange={f('model')} className={inputCls} placeholder="Corolla, Civic, Alto..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Year *</label>
                <input type="number" required min={1990} max={2030} value={form.year} onChange={f('year')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>License Plate *</label>
                <input type="text" required value={form.licensePlate} onChange={f('licensePlate')} className={inputCls} placeholder="LHR-1234" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Color *</label>
                <input type="text" required value={form.color} onChange={f('color')} className={inputCls} placeholder="White, Silver, Black..." />
              </div>
              <div>
                <label className={labelCls}>VIN (optional)</label>
                <input type="text" value={form.vin} onChange={f('vin')} className={inputCls} placeholder="Vehicle Identification Number" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes (optional)</label>
              <textarea value={form.notes} onChange={f('notes')} rows={3} className={inputCls + ' resize-none'}
                placeholder="Any additional notes about this vehicle..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-lg shadow-teal-500/20"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Vehicle
              </button>
              <Link href="/vehicles" className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
