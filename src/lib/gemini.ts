/**
 * Gemini 2.5 Flash backend — mirrors the same function signatures as claude.ts
 * Used when GOOGLE_AI_KEY is set and ANTHROPIC_API_KEY is not.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIAnalysisResult, ComparisonResult } from '@/types'
import type { YoloDetection } from './roboflow'
import type {
  DirectAnalysisResult,
  PanelIdentification,
  VerificationResult,
  FinalReport,
} from './claude'

let _client: GoogleGenerativeAI | null = null
function getClient() {
  if (!_client) {
    if (!process.env.GOOGLE_AI_KEY) throw new Error('GOOGLE_AI_KEY is not set')
    _client = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY)
  }
  return _client
}

const FLASH = 'gemini-2.5-flash'

function imagePart(base64: string, mimeType = 'image/jpeg') {
  return { inlineData: { data: base64, mimeType } }
}

function parseJson<T>(text: string): T {
  // Strip markdown code fences if Gemini wraps in ```json
  const stripped = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '')
  const m = stripped.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON in Gemini response')
  return JSON.parse(m[0]) as T
}

async function generate(prompt: string, imageBase64?: string): Promise<string> {
  const model = getClient().getGenerativeModel({ model: FLASH })
  const parts = imageBase64
    ? [imagePart(imageBase64), { text: prompt }]
    : [{ text: prompt }]
  const result = await model.generateContent(parts)
  return result.response.text()
}

/* ─── Legacy single-image analysis (for demo seeds + compare route) ─── */

const DAMAGE_ANALYSIS_PROMPT = `You are an expert automotive damage inspector. Analyze this car image and identify any damage.

Be CONSERVATIVE — only flag real physical damage. Do NOT flag:
- Reflections or glare on paint
- Aftermarket modifications (spoilers, body kits, custom rims, tinted lights)
- Stickers, decals, or license plate frames
- Dirt, dust, water drops, mud
- Shadows or lighting effects
- Normal panel gap lines or styling features

Return a JSON object with this exact structure:
{
  "overallCondition": "excellent" | "good" | "fair" | "poor",
  "damages": [
    {
      "type": "scratch" | "dent" | "crack" | "paint_chip" | "rust" | "broken" | "missing" | "other",
      "severity": "minor" | "moderate" | "severe",
      "location": "specific body panel (e.g. front bumper left, driver door center)",
      "description": "clear 20-40 word description",
      "estimatedCost": number in USD
    }
  ],
  "summary": "1-2 sentence overall summary",
  "recommendations": ["actionable item 1", "item 2"],
  "totalEstimatedCost": total in USD
}

If no real damage is visible, return an empty damages array and "excellent" condition.
Respond with ONLY the JSON object, no other text.`

const COMPARISON_PROMPT = `You are an expert automotive damage inspector comparing pre-rental and post-rental car images.

Pre-rental inspection damages (existing):
{PRE_DAMAGES}

Now analyze the post-rental image and identify:
1. Any NEW damage not present in the pre-rental inspection
2. Any worsening of existing damage

Be conservative: the same damage seen from a slightly different angle is NOT new damage.

Return a JSON object with this exact structure:
{
  "newDamages": [
    {
      "type": "scratch" | "dent" | "crack" | "paint_chip" | "rust" | "broken" | "missing" | "other",
      "severity": "minor" | "moderate" | "severe",
      "location": "specific location",
      "description": "clear description",
      "estimatedCost": number in USD,
      "isNew": true
    }
  ],
  "existingDamages": [list of pre-existing damages that are still present],
  "summary": "comparison summary",
  "hasNewDamage": boolean,
  "totalNewDamageCost": total cost of new damages in USD
}

Respond with ONLY the JSON object, no other text.`

export async function analyzeCarImage(imageBase64: string, mimeType = 'image/jpeg'): Promise<AIAnalysisResult> {
  const text = await generate(DAMAGE_ANALYSIS_PROMPT, imageBase64)
  return parseJson<AIAnalysisResult>(text)
}

export async function compareInspections(
  postImageBase64: string,
  preDamages: AIAnalysisResult['damages'],
  mimeType = 'image/jpeg',
): Promise<ComparisonResult> {
  const prompt = COMPARISON_PROMPT.replace('{PRE_DAMAGES}', JSON.stringify(preDamages, null, 2))
  const text = await generate(prompt, postImageBase64)
  return parseJson<ComparisonResult>(text)
}

/* ─── Pipeline Step 1 — Gemini direct analysis (no YOLO) ─────────────── */

const DIRECT_ANALYSIS_PROMPT = `You are an expert automotive damage inspector.

Analyze this car image for real physical damage. Be conservative — only flag genuine damage:
- Scratches (paint broken or removed)
- Dents (panel deformation)
- Cracks (in glass, plastic, or paint)
- Paint chips or peeling
- Rust
- Broken or missing parts

Do NOT flag reflections, modifications, dirt, shadows, or styling features.

Return ONLY this JSON (no other text):
{
  "damages": [
    {
      "type": "scratch" | "dent" | "crack" | "paint_chip" | "rust" | "broken" | "missing" | "other",
      "severity": "minor" | "moderate" | "severe",
      "panelCode": one of [front_bumper, hood, windshield, roof, trunk_lid, rear_bumper, rear_window, driver_door, passenger_door, rear_driver_door, rear_passenger_door, front_left_fender, front_right_fender, rear_left_quarter, rear_right_quarter, driver_mirror, passenger_mirror, driver_rocker, passenger_rocker, other],
      "location": "specific position on the panel (e.g. lower left, center, edge)",
      "description": "clear description in 15-40 words",
      "confidence": 0.0-1.0,
      "estimatedCostPKR": realistic repair cost in Pakistani Rupees
    }
  ],
  "angle": "front" | "rear" | "driver_side" | "passenger_side" | "corner" | "interior" | "other",
  "visiblePanels": ["list of body panels clearly visible in this frame"]
}`

export async function analyzeFrameDirect(imageBase64: string): Promise<DirectAnalysisResult> {
  try {
    const text = await generate(DIRECT_ANALYSIS_PROMPT, imageBase64)
    return parseJson<DirectAnalysisResult>(text)
  } catch {
    return { damages: [], angle: 'other', visiblePanels: [] }
  }
}

/* ─── Pipeline Step 2 — Panel identification (with YOLO) ─────────────── */

export async function identifyPanel(
  imageBase64: string,
  detections: YoloDetection[],
): Promise<PanelIdentification> {
  const detectionDesc = detections
    .map((d, i) => `Detection ${i}: ${d.class} (${Math.round(d.confidence * 100)}% confidence) at approx. center (${Math.round(d.x)}, ${Math.round(d.y)})`)
    .join('\n')

  const prompt = `You are analyzing a car photograph. Damage has been detected at these locations:
${detectionDesc}

Identify which car body panels are visible and which panel each detection is on.

Return ONLY this JSON (no other text):
{
  "angle": "front" | "rear" | "driver_side" | "passenger_side" | "front_left_corner" | "front_right_corner" | "rear_left_corner" | "rear_right_corner" | "roof" | "interior" | "other",
  "primaryPanel": one of [front_bumper, hood, windshield, roof, trunk_lid, rear_bumper, rear_window, driver_door, passenger_door, rear_driver_door, rear_passenger_door, front_left_fender, front_right_fender, rear_left_quarter, rear_right_quarter, driver_mirror, passenger_mirror, driver_rocker, passenger_rocker, other],
  "detectionPanels": ["panelCode for detection 0", "panelCode for detection 1"],
  "visiblePanels": ["all panels clearly visible in this image"]
}`

  try {
    const text = await generate(prompt, imageBase64)
    return parseJson<PanelIdentification>(text)
  } catch {
    return { angle: 'other', primaryPanel: 'other', detectionPanels: [], visiblePanels: [] }
  }
}

/* ─── Pipeline Step 3 — Damage verification ──────────────────────────── */

export async function verifyDamage(
  imageBase64: string,
  detectedClass: string,
): Promise<VerificationResult> {
  const prompt = `You are a professional automotive damage inspector. A computer vision model has flagged a region of this car image as potential "${detectedClass}" damage.

Your job: determine if this is REAL automotive damage or a false positive.

REAL damage: scratches, dents, cracks, paint chips, rust, broken parts, missing parts.
FALSE POSITIVES to reject: reflections on paint, stickers or decals, aftermarket mods (spoilers, body kits, custom rims), dirt or dust, water drops, shadows, panel gap lines, manufacturer styling features, tire scuffs (not rim damage), tinted windows or lights.

Return ONLY this JSON (no other text):
{
  "isDamage": boolean,
  "confidence": 0.0-1.0,
  "damageType": "scratch" | "dent" | "crack" | "paint_chip" | "rust" | "broken" | "missing" | "other" | null,
  "severity": "minor" | "moderate" | "severe" | null,
  "description": "25-50 word specific description of what you see" | null,
  "estimatedCostPKR": realistic PKR repair cost (e.g. 3000 for minor scratch, 25000 for dent, 80000 for crack) | null,
  "rejectionReason": "what it actually is if not real damage" | null
}`

  try {
    const text = await generate(prompt, imageBase64)
    return parseJson<VerificationResult>(text)
  } catch {
    return { isDamage: false, confidence: 0, damageType: null, severity: null, description: null, estimatedCostPKR: null, rejectionReason: 'parse error' }
  }
}

/* ─── Final report generation ─────────────────────────────────────────── */

export async function generateInspectionReport(params: {
  vehicleInfo: { make: string; model: string; year: number; licensePlate: string }
  inspectionType: string
  damages: Array<{
    type: string; severity: string; location: string; description: string
    panelCode?: string; confidence?: number; frameCount?: number
    estimatedCostPKR?: number
  }>
  framesAnalyzed: number
  qualityScore: number
  visiblePanels: string[]
}): Promise<FinalReport> {
  const { vehicleInfo, inspectionType, damages, framesAnalyzed, qualityScore, visiblePanels } = params

  const damagesText = damages.length === 0
    ? 'No damage detected.'
    : damages.map((d, i) =>
        `${i + 1}. ${d.severity.toUpperCase()} ${d.type} on ${d.location}${d.panelCode ? ` (${d.panelCode})` : ''}: ${d.description}. Estimated repair: PKR ${d.estimatedCostPKR ?? 0}. Confirmed in ${d.frameCount ?? 1} frame(s).`
      ).join('\n')

  const totalCost = damages.reduce((s, d) => s + (d.estimatedCostPKR ?? 0), 0)
  const highConf = damages.filter(d => (d.confidence ?? 0) >= 0.75).length
  const coverageQuality = qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'good' : 'limited'

  const prompt = `You are generating a professional AI vehicle inspection report. Be honest, specific, and actionable.

VEHICLE: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} (${vehicleInfo.licensePlate})
INSPECTION TYPE: ${inspectionType.replace(/_/g, ' ')}
FRAMES ANALYZED: ${framesAnalyzed}
COVERAGE QUALITY: ${coverageQuality} (${Math.round(qualityScore)}% score)
PANELS COVERED: ${visiblePanels.join(', ') || 'standard walkaround angles'}

VERIFIED DAMAGES (${damages.length} total, PKR ${totalCost.toLocaleString()} estimated):
${damagesText}

HIGH CONFIDENCE FINDINGS: ${highConf} of ${damages.length}

Generate a professional inspection report. For PKR amounts: PKR 3,000-8,000 = minor scratch/chip; PKR 15,000-40,000 = dent; PKR 40,000-120,000 = bumper crack; PKR 100,000+ = structural.

Return ONLY this JSON (no other text):
{
  "executiveSummary": "2-3 sentence professional summary of the inspection findings",
  "overallScore": 0-100 (100=perfect, 85=minor wear, 70=noticeable damage, 50=significant damage, below 50=poor condition),
  "letterGrade": "A" | "B" | "C" | "D" | "F",
  "conditionLabel": "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor",
  "totalRepairCostPKR": ${totalCost},
  "totalRepairCostMin": conservative low estimate in PKR,
  "totalRepairCostMax": conservative high estimate in PKR,
  "recommendation": "clear 1-2 sentence actionable advice for the user",
  "coverageStatement": "honest statement about what was and wasn't inspected",
  "nextSteps": ["2-4 specific next steps"],
  "confidenceLevel": "high" | "medium" | "low",
  "disclaimer": "standard AI inspection limitation disclaimer in 1 sentence"
}`

  try {
    const text = await generate(prompt)
    return parseJson<FinalReport>(text)
  } catch {
    return {
      executiveSummary: `Inspection completed. ${damages.length} damage item(s) found.`,
      overallScore: Math.max(0, 90 - damages.length * 8),
      letterGrade: damages.length === 0 ? 'A' : damages.length <= 2 ? 'B' : damages.length <= 4 ? 'C' : 'D',
      conditionLabel: damages.length === 0 ? 'Excellent' : damages.length <= 2 ? 'Good' : 'Fair',
      totalRepairCostPKR: totalCost,
      totalRepairCostMin: Math.round(totalCost * 0.85),
      totalRepairCostMax: Math.round(totalCost * 1.25),
      recommendation: damages.length === 0 ? 'Vehicle appears in good condition.' : 'Have damages inspected by a body shop.',
      coverageStatement: `${framesAnalyzed} frames analyzed across visible panels.`,
      nextSteps: ['Review damage details', 'Get repair quotes'],
      confidenceLevel: qualityScore >= 70 ? 'high' : 'medium',
      disclaimer: 'This AI inspection is a screening tool and does not replace a physical inspection by a qualified mechanic.',
    }
  }
}
