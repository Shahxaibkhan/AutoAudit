'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  url: string            // DELETE endpoint
  confirm: string        // confirmation message shown in dialog
  label?: string         // button text (default: "Delete")
  className?: string
  iconOnly?: boolean     // show only trash icon
  redirectTo?: string    // navigate here after deletion
}

export default function DeleteButton({ url, confirm, label = 'Delete', className, iconOnly, redirectTo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm(confirm)) return
    setLoading(true)
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Delete failed')
      }
      toast.success('Deleted successfully')
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete() }}
      disabled={loading}
      className={className ?? 'flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium'}
      title={label}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Trash2 className="w-3.5 h-3.5" />}
      {!iconOnly && <span>{loading ? 'Deleting…' : label}</span>}
    </button>
  )
}
