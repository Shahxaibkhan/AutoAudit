'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Camera, Upload, CheckCircle, Loader2, X, Sparkles,
  Video, Sun, Focus, AlertTriangle, RotateCcw, Play, Square,
  ChevronRight, ImageIcon, Film
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

/* ─── types ─────────────────────────────────────────────────────────── */

type CaptureMode = 'select' | 'photo' | 'video'
type VideoState = 'checklist' | 'recording' | 'extracting' | 'review'
interface UploadedImage { id: string; url: string; angle: string }

const PHOTO_ANGLES = [
  { key: 'front', label: 'Front', desc: 'Straight-on front of car' },
  { key: 'rear', label: 'Rear', desc: 'Straight-on rear of car' },
  { key: 'left', label: 'Left Side', desc: 'Full driver side' },
  { key: 'right', label: 'Right Side', desc: 'Full passenger side' },
  { key: 'left_front', label: 'Left Front', desc: 'Front left corner' },
  { key: 'right_front', label: 'Right Front', desc: 'Front right corner' },
  { key: 'left_rear', label: 'Left Rear', desc: 'Rear left corner' },
  { key: 'right_rear', label: 'Right Rear', desc: 'Rear right corner' },
]

const CHECKLIST = [
  { icon: Sun, text: 'Car is in good natural lighting' },
  { icon: Camera, text: 'Camera lens is clean and dry' },
  { icon: Focus, text: 'You have space to walk around the entire car' },
  { icon: Film, text: 'You have at least 200MB free storage' },
]

/* ─── brightness helper (runs in browser) ───────────────────────────── */

function getAverageBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const sample = ctx.getImageData(0, 0, w, h)
  let sum = 0
  for (let i = 0; i < sample.data.length; i += 4) {
    sum += 0.299 * sample.data[i] + 0.587 * sample.data[i + 1] + 0.114 * sample.data[i + 2]
  }
  return sum / (w * h)
}

/* ─── frame extraction from recorded video blob ─────────────────────── */

async function extractFrames(blob: Blob, targetCount = 35): Promise<File[]> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.preload = 'auto'

    video.onloadedmetadata = async () => {
      const duration = video.duration
      const canvas = document.createElement('canvas')
      canvas.width = 1280
      canvas.height = Math.round(1280 * (video.videoHeight / video.videoWidth)) || 720
      const ctx = canvas.getContext('2d')!

      const frames: { file: File; brightness: number; time: number }[] = []
      const step = duration / (targetCount * 2.5)

      for (let t = 0.5; t < duration - 0.5; t += step) {
        video.currentTime = t
        await new Promise<void>(res => { video.onseeked = () => res() })
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const brightness = getAverageBrightness(ctx, canvas.width, canvas.height)
        if (brightness < 25 || brightness > 235) continue // skip dark/overexposed

        const jpegBlob = await new Promise<Blob>(res =>
          canvas.toBlob(b => res(b!), 'image/jpeg', 0.82)
        )
        frames.push({
          file: new File([jpegBlob], `frame-${Math.round(t * 1000)}.jpg`, { type: 'image/jpeg' }),
          brightness,
          time: t,
        })
      }

      URL.revokeObjectURL(url)

      // Temporal spread: keep evenly distributed frames up to targetCount
      frames.sort((a, b) => a.time - b.time)
      const step2 = Math.max(1, Math.ceil(frames.length / targetCount))
      const selected = frames.filter((_, i) => i % step2 === 0).slice(0, targetCount)
      resolve(selected.map(f => f.file))
    }

    video.onerror = () => { URL.revokeObjectURL(url); resolve([]) }
  })
}

/* ─── iOS detection ──────────────────────────────────────────────────── */

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
}

/* ─── component ─────────────────────────────────────────────────────── */

export default function CapturePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const iosVideoInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const brightnessCanvasRef = useRef<HTMLCanvasElement>(null)

  const [iosDevice, setIosDevice] = useState(false)
  const [mode, setMode] = useState<CaptureMode>('select')
  const [videoState, setVideoState] = useState<VideoState>('checklist')

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [currentAngle, setCurrentAngle] = useState(PHOTO_ANGLES[0].key)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')

  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [brightness, setBrightness] = useState(150)
  const [qualityWarning, setQualityWarning] = useState('')
  const [extractedFrames, setExtractedFrames] = useState<File[]>([])
  const [framePreviews, setFramePreviews] = useState<string[]>([])
  const [extracting, setExtracting] = useState(false)

  const [inspection, setInspection] = useState<{
    vehicle: { make: string; model: string; year: number }
    type: string
  } | null>(null)

  useEffect(() => {
    setIosDevice(isIOS())
    fetch(`/api/inspections/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setInspection(d)
        setUploadedImages(d.images || [])
      })
      .catch(() => toast.error('Failed to load inspection'))
  }, [params.id])

  /* ── Brightness monitoring during recording ─────────────────────── */
  useEffect(() => {
    if (!recording) return
    const interval = setInterval(() => {
      const video = videoRef.current
      const canvas = brightnessCanvasRef.current
      if (!video || !canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = 80; canvas.height = 60
      ctx.drawImage(video, 0, 0, 80, 60)
      const b = getAverageBrightness(ctx, 80, 60)
      setBrightness(b)
      if (b < 40) setQualityWarning('Too dark — move to better light')
      else if (b > 220) setQualityWarning('Too much glare — adjust angle')
      else setQualityWarning('')
    }, 1000)
    return () => clearInterval(interval)
  }, [recording])

  /* ── Elapsed timer ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!recording) return
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e >= 89) stopRecording()
        return e + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [recording])

  /* ── Camera start ────────────────────────────────────────────────── */
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setVideoState('recording')
    } catch {
      toast.error('Camera access denied — switch to photo mode')
    }
  }

  /* ── Recording start/stop ────────────────────────────────────────── */
  function startRecording() {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.start(500)
    recorderRef.current = recorder
    setRecording(true)
    setElapsed(0)
  }

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    setRecording(false)

    await new Promise<void>(resolve => {
      recorder.onstop = () => resolve()
      recorder.stop()
    })

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    if (blob.size < 50_000) {
      toast.error('Recording too short — please try again')
      setVideoState('checklist')
      return
    }

    setVideoState('extracting')
    setExtracting(true)
    toast('Extracting best frames from video…', { icon: '⚙️' })

    const frames = await extractFrames(blob, 35)
    if (frames.length === 0) {
      toast.error('Could not extract frames — please try photo mode instead')
      setVideoState('checklist')
      setExtracting(false)
      return
    }

    // Build preview URLs
    const previews = await Promise.all(
      frames.slice(0, 9).map(f => new Promise<string>(res => {
        const reader = new FileReader()
        reader.onload = e => res(e.target?.result as string)
        reader.readAsDataURL(f)
      }))
    )

    setExtractedFrames(frames)
    setFramePreviews(previews)
    setExtracting(false)
    setVideoState('review')
  }, [])

  /* ── Upload extracted frames ─────────────────────────────────────── */
  async function uploadFrames() {
    if (extractedFrames.length === 0) return
    setUploading(true)
    const newImages: UploadedImage[] = []

    for (let i = 0; i < extractedFrames.length; i++) {
      try {
        const fd = new FormData()
        fd.append('file', extractedFrames[i])
        fd.append('inspectionId', params.id)
        fd.append('angle', `frame_${String(i).padStart(3, '0')}`)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) newImages.push(data)
      } catch { /* skip failed frames */ }
    }

    setUploadedImages(prev => [...prev, ...newImages])
    setUploading(false)
    toast.success(`${newImages.length} frames uploaded — ready to analyze`)
    await runAnalysis(newImages)
  }

  /* ── Photo upload (existing flow) ────────────────────────────────── */
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
        const next = PHOTO_ANGLES.find(a => !uploadedImages.some(i => i.angle === a.key) && a.key !== currentAngle)
        if (next) setCurrentAngle(next.key)
        toast.success(`${currentAngle.replace(/_/g, ' ')} uploaded`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── iOS native video handler ────────────────────────────────────── */
  async function handleIosVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!iosVideoInputRef.current) iosVideoInputRef.current = e.target as HTMLInputElement
    if (iosVideoInputRef.current) iosVideoInputRef.current.value = ''
    if (!file) return

    setMode('video')
    setVideoState('extracting')
    setExtracting(true)
    toast('Extracting best frames from video…', { icon: '⚙️' })

    const frames = await extractFrames(file, 35)
    if (frames.length === 0) {
      toast.error('Could not read video — please try photo mode instead')
      setMode('select')
      setExtracting(false)
      return
    }

    const previews = await Promise.all(
      frames.slice(0, 9).map(f => new Promise<string>(res => {
        const reader = new FileReader()
        reader.onload = ev => res(ev.target?.result as string)
        reader.readAsDataURL(f)
      }))
    )

    setExtractedFrames(frames)
    setFramePreviews(previews)
    setExtracting(false)
    setVideoState('review')
  }

  /* ── AI analysis ─────────────────────────────────────────────────── */
  async function runAnalysis(images?: UploadedImage[]) {
    const all = images ?? uploadedImages
    if (all.length === 0) return toast.error('No photos to analyze')
    setAnalyzing(true)

    const steps = [
      '🔍 Detecting damage regions…',
      '🧩 Identifying body panels…',
      '✅ Verifying detections…',
      '📊 Generating report…',
    ]
    let stepIdx = 0
    setAnalysisStep(steps[0])
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1)
      setAnalysisStep(steps[stepIdx])
    }, 12000)

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
      clearInterval(stepTimer)
      if (!res.ok) {
        if (data.error === 'limit_reached') {
          toast.error('Credit limit reached — upgrade your plan to continue')
        } else {
          throw new Error(data.error)
        }
        return
      }
      toast.success('AI analysis complete!')
      router.push(`/inspections/${params.id}/report`)
    } catch (err) {
      clearInterval(stepTimer)
      toast.error(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
      setAnalysisStep('')
    }
  }

  async function removeImage(imageId: string, angle: string) {
    setUploadedImages(prev => prev.filter(i => i.id !== imageId))
    setCurrentAngle(angle)
  }

  /* ─── render ─────────────────────────────────────────────────────── */

  const uploadedAngles = new Set(uploadedImages.map(i => i.angle))
  const photoProgress = Math.round((uploadedAngles.size / PHOTO_ANGLES.length) * 100)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/inspections/${params.id}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Capture Inspection</h1>
          {inspection && (
            <p className="text-slate-400 text-sm">
              {inspection.vehicle.make} {inspection.vehicle.model} {inspection.vehicle.year} — {inspection.type.replace(/_/g, ' ')}
            </p>
          )}
        </div>
      </div>

      {/* ── Mode selection ─────────────────────────────────────────── */}
      {mode === 'select' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-sm mb-5">Choose how to capture this inspection:</p>

          {/* Hidden iOS video file input */}
          {iosDevice && (
            <input
              ref={iosVideoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              className="hidden"
              onChange={handleIosVideoSelect}
            />
          )}

          <button
            onClick={() => iosDevice ? iosVideoInputRef.current?.click() : (setMode('video'), startCamera())}
            className="w-full flex items-center gap-5 bg-white border-2 border-teal-200 rounded-2xl p-5 text-left hover:border-teal-400 hover:bg-teal-50/50 transition-all group">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                Video walkaround
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">Recommended</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {iosDevice
                  ? 'Opens your iPhone camera. Record a walkaround — AI extracts frames automatically.'
                  : 'Record a 60-second walk around. AI extracts the best frames automatically.'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-400 transition-colors" />
          </button>

          <button onClick={() => setMode('photo')}
            className="w-full flex items-center gap-5 bg-white border-2 border-slate-200 rounded-2xl p-5 text-left hover:border-slate-300 transition-all group">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900">8-photo guide</div>
              <p className="text-sm text-slate-500 mt-0.5">Take 8 guided photos from specific angles. Good for slow networks.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
          </button>
        </div>
      )}

      {/* ── Video: pre-recording checklist ─────────────────────────── */}
      {mode === 'video' && videoState === 'checklist' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-slate-900 mb-1">Before you record</h2>
          <p className="text-slate-500 text-sm mb-6">30 seconds of prep = a much better result.</p>
          <div className="space-y-3 mb-8">
            {CHECKLIST.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{text}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm text-slate-600">
            <strong className="text-slate-800">How to record:</strong> Stand at the front, tap Record, then walk slowly clockwise around the entire car. Return to the front. Aim for 45–60 seconds.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setMode('select'); streamRef.current?.getTracks().forEach(t => t.stop()) }}
              className="py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Go back
            </button>
            <button onClick={() => { setVideoState('recording'); startCamera() }}
              className="py-3 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-400 transition-colors">
              I&apos;m Ready →
            </button>
          </div>
        </div>
      )}

      {/* ── Video: recording screen ────────────────────────────────── */}
      {mode === 'video' && videoState === 'recording' && (
        <div className="space-y-4">
          {/* Camera preview */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={brightnessCanvasRef} className="hidden" />

            {/* Quality warning overlay */}
            {qualityWarning && (
              <div className="absolute top-4 left-4 right-4 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {qualityWarning}
              </div>
            )}

            {/* Recording indicator */}
            {recording && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                REC {elapsed}s
              </div>
            )}

            {/* Progress arc (simplified as a timer bar) */}
            {recording && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${elapsed < 30 ? 'bg-amber-400' : 'bg-teal-400'}`}
                    style={{ width: `${Math.min(100, (elapsed / 60) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0s</span>
                  <span className={elapsed >= 30 ? 'text-teal-300 font-semibold' : ''}>
                    {elapsed >= 30 ? `${elapsed}s ✓` : `Need ${30 - elapsed}s more`}
                  </span>
                  <span>60s</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!recording ? (
              <>
                <button onClick={() => { setMode('select'); streamRef.current?.getTracks().forEach(t => t.stop()) }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={startRecording}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400 transition-colors flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> Start Recording
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 flex items-center gap-2 text-slate-500 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Walk slowly around the car…
                </div>
                <button onClick={stopRecording}
                  disabled={elapsed < 30}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-2">
                  <Square className="w-4 h-4 fill-white" />
                  {elapsed < 30 ? `Wait ${30 - elapsed}s` : 'Stop'}
                </button>
              </>
            )}
          </div>
          <p className="text-center text-xs text-slate-400">Auto-stops at 90 seconds · Minimum 30 seconds required</p>
        </div>
      )}

      {/* ── Video: extracting frames ───────────────────────────────── */}
      {mode === 'video' && videoState === 'extracting' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <Loader2 className="w-10 h-10 text-teal-500 mx-auto mb-4 animate-spin" />
          <h3 className="font-bold text-slate-900 mb-2">Extracting best frames…</h3>
          <p className="text-slate-500 text-sm">Filtering for clarity and coverage. This takes a few seconds.</p>
        </div>
      )}

      {/* ── Video: review extracted frames ────────────────────────── */}
      {mode === 'video' && videoState === 'review' && !analyzing && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Video processed</h3>
                <p className="text-slate-500 text-sm">{extractedFrames.length} frames extracted and ready</p>
              </div>
              <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                {extractedFrames.length} frames
              </div>
            </div>

            {/* Frame thumbnails */}
            {framePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {framePreviews.map((src, i) => (
                  <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img src={src} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {extractedFrames.length > 9 && (
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold">
                    +{extractedFrames.length - 9} more
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {
                  setExtractedFrames([])
                  setFramePreviews([])
                  setElapsed(0)
                  if (iosDevice) {
                    setMode('select')
                    setVideoState('checklist')
                  } else {
                    startCamera()
                  }
                }}
                className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
              <button onClick={uploadFrames} disabled={uploading}
                className="flex items-center justify-center gap-2 py-3 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-400 disabled:opacity-60 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {uploading ? 'Uploading…' : 'Analyze with AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI analysis progress ───────────────────────────────────── */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/20">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">AI Analysis Running</h3>
          <p className="text-teal-600 text-sm font-semibold mb-1">{analysisStep}</p>
          <p className="text-slate-400 text-xs">This takes 30–60 seconds. Please keep this page open.</p>
          <div className="mt-5 space-y-1.5 text-left max-w-xs mx-auto">
            {[
              '🔍 Detecting damage regions',
              '🧩 Identifying body panels',
              '✅ Verifying each detection',
              '📊 Generating final report',
            ].map((step, i) => {
              const currentStepIndex = ['Detecting', 'Identifying', 'Verifying', 'Generating']
                .findIndex(s => analysisStep.includes(s))
              const done = i < currentStepIndex
              const active = i === currentStepIndex
              return (
                <div key={step} className={`flex items-center gap-2 text-xs py-1 ${done ? 'text-emerald-600' : active ? 'text-slate-800 font-semibold' : 'text-slate-300'}`}>
                  {done ? '✅' : active ? '⏳' : '○'} {step}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Photo mode ────────────────────────────────────────────── */}
      {mode === 'photo' && !analyzing && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">{uploadedAngles.size} / {PHOTO_ANGLES.length} angles captured</span>
              <span className="text-sm font-bold text-teal-600">{photoProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${photoProgress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Angle selector */}
            <div className="sm:col-span-1 bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Angle</p>
              <div className="space-y-1">
                {PHOTO_ANGLES.map(angle => {
                  const done = uploadedAngles.has(angle.key)
                  const selected = currentAngle === angle.key
                  return (
                    <button key={angle.key} onClick={() => setCurrentAngle(angle.key)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors text-sm ${selected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {done ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Camera className="w-3 h-3 text-slate-400" />}
                      </div>
                      <div>
                        <div className={`font-medium text-xs ${done ? 'text-emerald-700' : selected ? 'text-teal-700' : 'text-slate-700'}`}>{angle.label}</div>
                        <div className="text-slate-400 text-xs">{angle.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Upload area */}
            <div className="sm:col-span-2 space-y-3">
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="w-8 h-8 text-teal-500 mx-auto animate-spin" /> : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        Capture <span className="text-teal-600 capitalize">{currentAngle.replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Tap to open camera or pick a photo</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
              </div>

              {/* Uploaded thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{uploadedImages.length} Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map(img => (
                      <div key={img.id} className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden">
                        <Image src={img.url} alt={img.angle} fill className="object-cover" sizes="150px" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-1.5 rounded-b-lg">
                          <span className="text-xs text-white font-medium capitalize">{img.angle.replace(/_/g, ' ')}</span>
                        </div>
                        <button onClick={() => removeImage(img.id, img.angle)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => runAnalysis()} disabled={analyzing || uploadedImages.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-teal-400 disabled:opacity-40 transition-colors">
                <Sparkles className="w-4 h-4" />
                Analyze with AI ({uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''})
              </button>
              {uploadedImages.length === 0 && (
                <p className="text-center text-xs text-slate-400">Upload at least one photo to analyze</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
