import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">You&apos;re all set!</h1>
        <p className="text-slate-500 mb-8">
          Your subscription is now active. Your inspection credits have been added to your account.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
