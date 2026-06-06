'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  async function handleDeleteAccount() {
    if (confirmText !== 'DELETE') return toast.error('Type DELETE to confirm')
    setDeleting(true)
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' })
      if (!res.ok) throw new Error('Deletion failed')
      toast.success('Account deleted. Goodbye!')
      await signOut({ redirect: false })
      router.push('/')
    } catch {
      toast.error('Failed to delete account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and data</p>
      </div>

      {/* Legal links */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4">Legal</h2>
        <div className="space-y-2">
          <Link href="/terms" target="_blank"
            className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-700">Terms of Service</span>
            <span className="text-xs text-slate-400">↗</span>
          </Link>
          <Link href="/privacy" target="_blank"
            className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-700">Privacy Policy</span>
            <span className="text-xs text-slate-400">↗</span>
          </Link>
        </div>
      </div>

      {/* Data export */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-1">Your Data</h2>
        <p className="text-slate-500 text-sm mb-4">Request a copy of your inspection data or contact us via WhatsApp.</p>
        <a href="https://wa.me/923434994409?text=I%20would%20like%20to%20request%20a%20copy%20of%20my%20AutoAuditAI%20data."
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
          Request data export via WhatsApp
        </a>
      </div>

      {/* Danger zone — delete account */}
      <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-700 mb-1">Delete Account</h2>
            <p className="text-sm text-slate-600">
              Permanently deletes your account, all vehicles, all inspections, all photos, and all reports.
              <strong className="text-red-600"> This cannot be undone.</strong>
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 bg-red-50/30"
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting || confirmText !== 'DELETE'}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Deleting…' : 'Delete my account permanently'}
          </button>
        </div>
      </div>
    </div>
  )
}
