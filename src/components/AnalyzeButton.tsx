'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnalyzeButton({ inspectionId, inspectionType }: {
  inspectionId: string
  inspectionType: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')

  async function handleAnalyze() {
    setLoading(true)
    const steps = ['Detecting damage regions…', 'Identifying panels…', 'Verifying findings…', 'Generating report…']
    let i = 0
    setStep(steps[0])
    const timer = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1)
      setStep(steps[i])
    }, 12000)

    try {
      const isPost = inspectionType === 'POST_RENTAL'
      const endpoint = isPost ? '/api/compare' : '/api/analyze'
      const body = isPost ? { postInspectionId: inspectionId } : { inspectionId }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      clearInterval(timer)

      if (!res.ok) {
        if (data.error === 'limit_reached') {
          toast.error('Credit limit reached — upgrade your plan to continue')
        } else if (data.error === 'demo_account') {
          toast.error('Demo accounts cannot run AI analysis. Sign up for a free account.')
        } else {
          toast.error(data.error || 'Analysis failed — please try again')
        }
        return
      }

      toast.success('Analysis complete!')
      router.push(`/inspections/${inspectionId}/review`)
      router.refresh()
    } catch {
      clearInterval(timer)
      toast.error('Analysis failed — please check your connection and retry')
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-lg shadow-indigo-500/20"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      {loading ? step || 'Analyzing…' : 'Analyze with AI'}
    </button>
  )
}
