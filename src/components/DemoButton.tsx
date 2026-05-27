'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DemoButton({ hasData }: { hasData: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)

  async function loadDemo() {
    setLoading(true)
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.alreadyExists) {
        toast('Demo data is already loaded', { icon: 'ℹ️' })
      } else {
        toast.success('Demo data loaded! Explore 3 sample vehicles and 5 inspections.')
      }
      router.refresh()
    } catch {
      toast.error('Failed to load demo data')
    } finally {
      setLoading(false)
    }
  }

  async function removeDemo() {
    setRemoving(true)
    try {
      const res = await fetch('/api/demo/seed', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Demo data removed')
      router.refresh()
    } catch {
      toast.error('Failed to remove demo data')
    } finally {
      setRemoving(false)
    }
  }

  if (hasData) {
    return (
      <button
        onClick={removeDemo}
        disabled={removing}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        title="Remove demo data"
      >
        {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Remove demo
      </button>
    )
  }

  return (
    <button
      onClick={loadDemo}
      disabled={loading}
      className="flex items-center gap-2 border border-dashed border-blue-300 text-blue-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-60 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {loading ? 'Loading demo...' : 'Try Demo'}
    </button>
  )
}
