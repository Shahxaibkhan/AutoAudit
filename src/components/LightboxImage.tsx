'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxImageProps {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  className?: string
  caption?: string
  // Optional gallery — pass all srcs + current index for prev/next
  gallery?: { src: string; caption?: string }[]
  galleryIndex?: number
}

export default function LightboxImage({
  src, alt, fill, sizes, className, caption,
  gallery, galleryIndex = 0,
}: LightboxImageProps) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(galleryIndex)

  // Sync gallery index when prop changes
  useEffect(() => { setIdx(galleryIndex) }, [galleryIndex])

  const current = gallery ? gallery[idx] : { src, caption }
  const total = gallery?.length ?? 1

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setIdx(i => (i - 1 + total) % total)
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setIdx(i => (i + 1) % total)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowLeft' && gallery) setIdx(i => (i - 1 + total) % total)
      if (e.key === 'ArrowRight' && gallery) setIdx(i => (i + 1) % total)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, gallery, total])

  return (
    <>
      {/* Thumbnail — clickable */}
      <div
        onClick={() => { setIdx(galleryIndex); setOpen(true) }}
        className={`cursor-zoom-in group ${fill ? 'absolute inset-0' : 'relative'}`}
        style={fill ? undefined : { display: 'inline-block' }}
      >
        {fill ? (
          <Image src={src} alt={alt} fill sizes={sizes} className={className} />
        ) : (
          <Image src={src} alt={alt} width={320} height={180} sizes={sizes} className={className} />
        )}
        {/* Zoom hint on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-inherit flex items-center justify-center">
          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </div>
      </div>

      {/* Lightbox modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          {gallery && total > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {idx + 1} / {total}
            </div>
          )}

          {/* Prev / Next */}
          {gallery && total > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="max-w-5xl max-h-[85vh] px-16 w-full flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.caption ?? alt}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {current.caption && (
              <p className="text-white/70 text-sm capitalize text-center">
                {current.caption.replace(/_/g, ' ')}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
