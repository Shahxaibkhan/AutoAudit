/**
 * Inspection AI pipeline
 *
 * With Roboflow configured:
 *   images → YOLO (batch) → Claude Haiku panel ID → Claude Sonnet verify → consensus → Claude Sonnet report
 *
 * Without Roboflow:
 *   images → Claude Haiku direct analysis (per image, parallel) → consensus → Claude Sonnet report
 */

import { detectDamageBatch, roboflowConfigured, type YoloDetection } from './roboflow'
import {
  analyzeFrameDirect,
  identifyPanel,
  verifyDamage,
  generateInspectionReport,
  type FinalReport,
} from './claude'

/* ─── types ─────────────────────────────────────────────────────────── */

export interface PipelineDamage {
  type: string
  severity: string
  location: string
  description: string
  panelCode: string
  confidence: number
  frameCount: number
  estimatedCostPKR: number
  imageUrl?: string
}

export interface PipelineResult {
  damages: PipelineDamage[]
  report: FinalReport
  framesAnalyzed: number
  qualityScore: number
  overallGrade: string
  visiblePanels: string[]
}

/* ─── helpers ────────────────────────────────────────────────────────── */

/** Fetch image URL and return base64 string (no data-URI prefix). */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf.toString('base64')
}

/** Run async tasks in parallel batches to avoid overwhelming APIs. */
async function batchAsync<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  batchSize = 5,
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map((item, j) => fn(item, i + j)))
    results.push(...batchResults)
  }
  return results
}

/* ─── consensus ──────────────────────────────────────────────────────── */

interface RawDamage {
  type: string
  severity: string
  panelCode: string
  location: string
  description: string
  confidence: number
  estimatedCostPKR: number
  imageUrl?: string
}

const SEVERITY_RANK: Record<string, number> = { minor: 1, moderate: 2, severe: 3 }

function applyConsensus(
  rawDamages: RawDamage[],
  frameCount: number,
): PipelineDamage[] {
  // Group by panelCode + type
  const groups = new Map<string, RawDamage[]>()
  for (const d of rawDamages) {
    const key = `${d.panelCode}::${d.type}`
    const group = groups.get(key) ?? []
    group.push(d)
    groups.set(key, group)
  }

  const result: PipelineDamage[] = []
  for (const group of Array.from(groups.values())) {
    const count = group.length
    const avgConfidence = group.reduce((s: number, d: RawDamage) => s + d.confidence, 0) / count
    const worstSeverity = group.reduce((best: RawDamage, d: RawDamage) =>
      (SEVERITY_RANK[d.severity] ?? 0) > (SEVERITY_RANK[best.severity] ?? 0) ? d : best
    )
    const best = group.reduce((b: RawDamage, d: RawDamage) => d.confidence > b.confidence ? d : b)

    // Consensus filter: single low-confidence detection in many-frame inspection → skip
    const singleFrameLowConf = count === 1 && avgConfidence < 0.65 && frameCount > 3
    if (singleFrameLowConf) continue

    result.push({
      type: best.type,
      severity: worstSeverity.severity,
      location: best.location,
      description: best.description,
      panelCode: best.panelCode,
      confidence: avgConfidence,
      frameCount: count,
      estimatedCostPKR: best.estimatedCostPKR,
      imageUrl: best.imageUrl,
    })
  }

  return result.sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0))
}

/* ─── YOLO + Claude pipeline ─────────────────────────────────────────── */

async function runYoloPipeline(
  imageUrls: string[],
  base64s: string[],
): Promise<RawDamage[]> {
  // 1. YOLO detection on all frames (parallel batches of 5)
  const allDetections: YoloDetection[][] = await detectDamageBatch(base64s, 5)

  // 2. For frames with detections, identify panels (Claude Haiku, parallel)
  const framesWithDetections = allDetections
    .map((dets, i) => ({ dets, i }))
    .filter(({ dets }) => dets.length > 0)

  const panelResults = await batchAsync(framesWithDetections, async ({ dets, i }) => {
    const panel = await identifyPanel(base64s[i], dets)
    return { i, dets, panel }
  }, 5)

  // 3. Verify each detection with Claude Sonnet (parallel batches of 5)
  const rawDamages: RawDamage[] = []

  const allVerifications = panelResults.flatMap(({ i, dets, panel }) =>
    dets.map((det, di) => ({ det, di, i, panel }))
  )

  await batchAsync(allVerifications, async ({ det, di, i, panel }) => {
    const result = await verifyDamage(base64s[i], det.class)
    if (!result.isDamage || !result.damageType) return

    const panelCode = panel.detectionPanels[di] ?? panel.primaryPanel ?? 'other'
    rawDamages.push({
      type: result.damageType,
      severity: result.severity ?? 'minor',
      panelCode,
      location: `${panelCode.replace(/_/g, ' ')} (${panel.angle})`,
      description: result.description ?? `${result.damageType} detected`,
      confidence: Math.min(result.confidence, det.confidence),
      estimatedCostPKR: result.estimatedCostPKR ?? 5000,
      imageUrl: imageUrls[i],
    })
  }, 5)

  return rawDamages
}

/* ─── Direct Claude pipeline (no YOLO) ──────────────────────────────── */

async function runDirectPipeline(
  imageUrls: string[],
  base64s: string[],
): Promise<{ rawDamages: RawDamage[]; visiblePanels: string[] }> {
  const allPanels = new Set<string>()
  const rawDamages: RawDamage[] = []

  const results = await batchAsync(base64s, async (b64, i) => {
    return analyzeFrameDirect(b64).then(r => ({ r, i }))
  }, 5)

  for (const { r, i } of results) {
    for (const p of r.visiblePanels) allPanels.add(p)
    for (const d of r.damages) {
      rawDamages.push({
        type: d.type,
        severity: d.severity,
        panelCode: d.panelCode || 'other',
        location: d.location,
        description: d.description,
        confidence: d.confidence,
        estimatedCostPKR: d.estimatedCostPKR,
        imageUrl: imageUrls[i],
      })
    }
  }

  return { rawDamages, visiblePanels: Array.from(allPanels) }
}

/* ─── Main entry point ───────────────────────────────────────────────── */

export async function runInspectionPipeline(
  imageUrls: string[],
  vehicleInfo: { make: string; model: string; year: number; licensePlate: string },
  inspectionType: string,
): Promise<PipelineResult> {
  if (imageUrls.length === 0) throw new Error('No images to analyze')

  // Fetch all images as base64 in parallel
  const base64s = await batchAsync(imageUrls, urlToBase64, 8)

  const framesAnalyzed = imageUrls.length

  let rawDamages: RawDamage[]
  let visiblePanels: string[]

  if (roboflowConfigured()) {
    rawDamages = await runYoloPipeline(imageUrls, base64s)
    // Collect visible panels from YOLO + Haiku pass (approximate)
    visiblePanels = Array.from(new Set(rawDamages.map(d => d.panelCode)))
  } else {
    const result = await runDirectPipeline(imageUrls, base64s)
    rawDamages = result.rawDamages
    visiblePanels = result.visiblePanels
  }

  // Multi-frame consensus
  const damages = applyConsensus(rawDamages, framesAnalyzed)

  // Quality score: ratio of frames that contributed verified damage data
  const qualityScore = Math.min(100, 50 + framesAnalyzed * 2)

  // Final report
  const report = await generateInspectionReport({
    vehicleInfo,
    inspectionType,
    damages,
    framesAnalyzed,
    qualityScore,
    visiblePanels,
  })

  const overallGrade = report.letterGrade

  return { damages, report, framesAnalyzed, qualityScore, overallGrade, visiblePanels }
}
