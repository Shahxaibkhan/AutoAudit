'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Upload, CheckCircle, Loader2, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const ANGLES = [
  { key: 'front', label: 'Front', icon: '🚗', desc: 'Straight-on front of car' },
  { key: 'rear', label: 'Rear', icon: '🚗', desc: 'Straight-on rear of car' },
  { key: 'left', label: 'Left Side', icon: '🚗', desc: 'Full driver side' },
  { key: 'right', label: 'Right Side', icon: '🚗', desc: 'Full passenger side' },
  { key: 'left_front', label: 'Left Front', icon: '🚗', desc: 'Front left corner' },
  { key: 'right_front', label: 'Right Front', icon: '🚗', desc: 'Front right corner' },
  { key: 'left_rear', label: 'Left Rear', icon: '🚗', desc: 'Rear left corner' },
  { key: 'right_rear', label: 'Right Rear', icon: '🚗', desc: 'Rear right corner' },
]

interface UploadedImage { id: string; url: string; angle: string }

export default function CapturePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [currentAngle, setCurrentAngle] = useState(ANGLES[0].key)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [inspection, setInspection] = useState<{ vehicle: { make: string; model: string; year: number }; type: string } | null>(null)

  useEffect(() => {
    fetch(`/api/inspections/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setInspection(d)
        setUploadedImages(d.images || [])
      })
      .catch(() => toast.error('Failed to load inspection'))
  }, [params.id])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('inspectionId', params.id)
        fd.append('angle', currentAngle)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setUploadedImages(prev => {
          const filtered = prev.filter(img => img.angle !== currentAngle)
          return [...filtered, data]
        })

        const nextAngle = ANGLES.find(a => !uploadedImages.some(img => img.angle === a.key) && a.key !== currentAngle)
        if (nextAngle) setCurrentAngle(nextAngle.key)
        toast.success(`${currentAngle.replace('_', ' ')} photo uploaded`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAnalyze() {
    if (uploadedImages.length === 0) return toast.error('Upload at least one photo first')
    setAnalyzing(true)
    try {
      const endpoint = inspection?.type === 'POST_RENTAL' ? '/api/compare' : '/api/analyze'
      const body = inspection?.type === 'POST_RENTAL'
        ? { postInspectionId: params.id }
        : { inspectionId: params.id }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('AI analysis complete!')
      router.push(`/inspections/${params.id}/report`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  async function removeImage(imageId: string, angle: string) {
    setUploadedImages(prev => prev.filter(i => i.id !== imageId))
    setCurrentAngle(angle)
  }

  const uploadedAngles = new Set(uploadedImages.map(i => i.angle))
  const progress = Math.round((uploadedAngles.size / ANGLES.length) * 100)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/inspections/${params.id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Capture</h1>
          {inspection && (
            <p className="text-gray-500 text-sm mt-0.5">
              {inspection.vehicle.make} {inspection.vehicle.model} ({inspection.vehicle.year}) — {inspection.type.replace('_', ' ')}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{uploadedAngles.size} of {ANGLES.length} angles captured</span>
          <span className="text-sm font-semibold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Angle selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Angle to Capture</h2>
            <div className="space-y-2">
              {ANGLES.map(angle => {
                const done = uploadedAngles.has(angle.key)
                const selected = currentAngle === angle.key
                return (
                  <button
                    key={angle.key}
                    onClick={() => setCurrentAngle(angle.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selected ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {done ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Camera className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{angle.label}</div>
                      <div className="text-xs text-gray-400">{angle.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Uploading: <span className="text-blue-600 capitalize">{currentAngle.replace('_', ' ')}</span>
              </h2>
            </div>

            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="w-10 h-10 text-blue-500 mx-auto animate-spin" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              capture="environment"
            />
          </div>

          {/* Uploaded photos grid */}
          {uploadedImages.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Photos ({uploadedImages.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uploadedImages.map(img => (
                  <div key={img.id} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={img.url}
                        alt={img.angle}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                      <span className="text-xs text-white font-medium capitalize">{img.angle.replace('_', ' ')}</span>
                    </div>
                    <button
                      onClick={() => removeImage(img.id, img.angle)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || uploadedImages.length === 0}
            className="w-full flex items-center justify-center gap-2.5 bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI is analyzing {uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with AI ({uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''})
              </>
            )}
          </button>
          {uploadedImages.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">Upload at least one photo to enable AI analysis</p>
          )}
        </div>
      </div>
    </div>
  )
}
