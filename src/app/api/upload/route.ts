import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const inspectionId = formData.get('inspectionId') as string
  const angle = formData.get('angle') as string

  if (!file || !inspectionId || !angle) {
    return NextResponse.json({ error: 'file, inspectionId and angle are required' }, { status: 400 })
  }

  const inspection = await prisma.inspection.findFirst({ where: { id: inspectionId, userId } })
  if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })

  const ext = file.name.split('.').pop() || 'jpg'

  let blob: { url: string }
  try {
    blob = await put(`inspections/${inspectionId}/${angle}-${Date.now()}.${ext}`, file, {
      access: 'public',
    })
  } catch (blobErr) {
    const msg = blobErr instanceof Error ? blobErr.message : 'Upload failed'
    console.error('Blob upload error:', msg)
    // Private store? Surface a clear message instead of crashing
    if (msg.includes('private store')) {
      return NextResponse.json(
        { error: 'Image storage is misconfigured: Blob store must be set to public access. Go to Vercel Dashboard → Storage → Blob and recreate the store with public access.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const image = await prisma.inspectionImage.create({
    data: { inspectionId, url: blob.url, angle },
  })

  return NextResponse.json({ id: image.id, url: blob.url, angle }, { status: 201 })
}
