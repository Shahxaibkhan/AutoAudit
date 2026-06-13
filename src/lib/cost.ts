/**
 * Inspection cost model
 * ----------------------
 * Estimates the marginal cost of running ONE inspection through the AI pipeline.
 *
 * The pipeline (see pipeline.ts) has two shapes:
 *
 *   DIRECT (current MVP — Gemini, no Roboflow):
 *     N images → analyzeFrameDirect (1 vision call each) → 1 text report
 *     ⇒ N vision calls + 1 text call
 *
 *   ROBOFLOW (full flow — YOLO + Claude):
 *     N images → YOLO detect (each) → identifyPanel (Haiku, frames w/ detections)
 *               → verifyDamage (Sonnet, per detection) → 1 report (Sonnet)
 *     ⇒ N YOLO calls + D_frames Haiku calls + D_dets Sonnet calls + 1 Sonnet text call
 *
 * ⚠️  Two groups of numbers are ASSUMPTIONS you should verify against live data:
 *      1. MODEL_PRICING  — provider $/1M tokens + Roboflow $/image (check dashboards)
 *      2. TOKENS / IMAGE_TOKENS — typical token counts per call (sample real calls)
 *     Everything else (call counts, frame counts) is taken from the actual code.
 *
 * All values are pure/deterministic — safe to import on client or server.
 */

/* ─── Model pricing (USD per 1,000,000 tokens) — VERIFY against live pricing ─── */
export interface ModelPrice {
  inputPerM: number   // USD per 1M input tokens
  outputPerM: number  // USD per 1M output tokens
}

export const MODEL_PRICING = {
  // Google — current MVP backend
  'gemini-2.5-flash': { inputPerM: 0.30, outputPerM: 2.50 },
  // Anthropic — production backend (full flow)
  'claude-haiku-4-5': { inputPerM: 1.00, outputPerM: 5.00 },
  'claude-sonnet-4': { inputPerM: 3.00, outputPerM: 15.00 },
} as const satisfies Record<string, ModelPrice>

export type ModelId = keyof typeof MODEL_PRICING

/** Roboflow hosted inference — USD per image. VERIFY (depends on plan). */
export const ROBOFLOW_PER_IMAGE = 0.0004

/* ─── How many tokens an image costs as input, per provider ─── */
// Anthropic ≈ (w × h) / 750  → 1280×720 ≈ 1230 tokens. Gemini tiles 768px at 258 tok/tile.
export const IMAGE_TOKENS = {
  gemini: 560,   // ~2 tiles @ 768px for a 1280×720 frame  (VERIFY)
  claude: 1300,  // ~1280×720 frame                          (VERIFY)
} as const

/* ─── Typical text tokens per call (excludes the image tokens above) — VERIFY ─── */
export const CALL_TOKENS = {
  // Per-frame direct analysis (analyzeFrameDirect)
  analyzeFrame: { promptIn: 500, out: 350 },
  // YOLO → panel identification (identifyPanel, Haiku)
  identifyPanel: { promptIn: 400, out: 250 },
  // Per-detection verification (verifyDamage, Sonnet)
  verifyDamage: { promptIn: 300, out: 200 },
  // Final report (generateInspectionReport, text-only — no image)
  report: { promptIn: 800, out: 700 },
} as const

/* ─── Non-AI marginal costs per inspection (USD) — rough, VERIFY ─── */
export const INFRA_COST = {
  blob: 0.003,   // Vercel Blob storage + egress for the frames
  db: 0.001,     // Neon storage + compute
  email: 0.0004, // Resend completion email
} as const

/* ─── Frame counts taken from the code ─── */
export const FRAME_COUNTS = {
  video: 35, // extractFrames(blob, 35) in capture/page.tsx
  photo: 8,  // PHOTO_ANGLES.length (up to 16 with close-ups)
} as const

/* ─── helpers ─── */
const round = (n: number, dp = 4) => Math.round(n * 10 ** dp) / 10 ** dp

/** Cost of one model call given input & output token counts. */
export function callCost(model: ModelId, inputTokens: number, outputTokens: number): number {
  const p = MODEL_PRICING[model]
  return (inputTokens / 1_000_000) * p.inputPerM + (outputTokens / 1_000_000) * p.outputPerM
}

/* ─── scenario definition ─── */
export type Provider = 'gemini' | 'claude'

export interface CostInput {
  /** Number of images analysed (video ≈ 35, photo ≈ 8). */
  frames: number
  /** Which vision/text backend runs the AI calls. */
  provider: Provider
  /** Whether the Roboflow YOLO pre-pass is enabled. */
  roboflow?: boolean
  /** Avg fraction of frames that produce ≥1 YOLO detection (roboflow only). */
  detectionFrameRatio?: number
  /** Avg detections per detected frame (roboflow only). */
  detectionsPerFrame?: number
}

export interface CostBreakdown {
  scenario: string
  frames: number
  provider: Provider
  roboflow: boolean
  lines: { label: string; calls: number; usd: number }[]
  aiUsd: number
  infraUsd: number
  totalUsd: number
  totalPKR: number
}

/** USD → PKR for display. VERIFY exchange rate. */
export const USD_TO_PKR = 280

/**
 * Estimate the marginal cost of a single inspection.
 */
export function estimateInspectionCost(input: CostInput): CostBreakdown {
  const {
    frames,
    provider,
    roboflow = false,
    detectionFrameRatio = 0.3,
    detectionsPerFrame = 1.5,
  } = input

  const imgTok = IMAGE_TOKENS[provider]
  const visionModel: ModelId = provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-haiku-4-5'
  const reportModel: ModelId = provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-sonnet-4'
  const verifyModel: ModelId = provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-sonnet-4'
  const panelModel: ModelId = provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-haiku-4-5'

  const lines: CostBreakdown['lines'] = []

  if (!roboflow) {
    // DIRECT pipeline: N vision calls + 1 text report
    const perFrame = callCost(
      visionModel,
      imgTok + CALL_TOKENS.analyzeFrame.promptIn,
      CALL_TOKENS.analyzeFrame.out,
    )
    lines.push({ label: `Frame analysis × ${frames}`, calls: frames, usd: round(perFrame * frames) })

    const report = callCost(reportModel, CALL_TOKENS.report.promptIn, CALL_TOKENS.report.out)
    lines.push({ label: 'Final report × 1', calls: 1, usd: round(report) })
  } else {
    // ROBOFLOW pipeline
    const detFrames = Math.round(frames * detectionFrameRatio)
    const detections = Math.round(detFrames * detectionsPerFrame)

    lines.push({
      label: `YOLO detection × ${frames}`,
      calls: frames,
      usd: round(frames * ROBOFLOW_PER_IMAGE),
    })

    const panel = callCost(
      panelModel,
      imgTok + CALL_TOKENS.identifyPanel.promptIn,
      CALL_TOKENS.identifyPanel.out,
    )
    lines.push({ label: `Panel ID × ${detFrames}`, calls: detFrames, usd: round(panel * detFrames) })

    const verify = callCost(
      verifyModel,
      imgTok + CALL_TOKENS.verifyDamage.promptIn,
      CALL_TOKENS.verifyDamage.out,
    )
    lines.push({ label: `Damage verify × ${detections}`, calls: detections, usd: round(verify * detections) })

    const report = callCost(reportModel, CALL_TOKENS.report.promptIn, CALL_TOKENS.report.out)
    lines.push({ label: 'Final report × 1', calls: 1, usd: round(report) })
  }

  const aiUsd = round(lines.reduce((s, l) => s + l.usd, 0))
  const infraUsd = round(INFRA_COST.blob + INFRA_COST.db + INFRA_COST.email)
  const totalUsd = round(aiUsd + infraUsd)

  return {
    scenario: `${roboflow ? 'Roboflow + ' : ''}${provider === 'gemini' ? 'Gemini 2.5 Flash' : 'Claude'} · ${frames} frames`,
    frames,
    provider,
    roboflow,
    lines,
    aiUsd,
    infraUsd,
    totalUsd,
    totalPKR: Math.round(totalUsd * USD_TO_PKR),
  }
}

/* ─── Named presets ─── */
export const COST_PRESETS = {
  /** Current MVP — Gemini, video walkaround (35 frames). */
  mvpVideo: (): CostBreakdown =>
    estimateInspectionCost({ frames: FRAME_COUNTS.video, provider: 'gemini' }),
  /** Current MVP — Gemini, 8-photo capture. */
  mvpPhoto: (): CostBreakdown =>
    estimateInspectionCost({ frames: FRAME_COUNTS.photo, provider: 'gemini' }),
  /** Full flow — Claude direct, video. */
  claudeVideo: (): CostBreakdown =>
    estimateInspectionCost({ frames: FRAME_COUNTS.video, provider: 'claude' }),
  /** Full flow — Claude direct, photo. */
  claudePhoto: (): CostBreakdown =>
    estimateInspectionCost({ frames: FRAME_COUNTS.photo, provider: 'claude' }),
  /** Full flow — Roboflow YOLO + Claude, video. */
  roboflowVideo: (): CostBreakdown =>
    estimateInspectionCost({ frames: FRAME_COUNTS.video, provider: 'claude', roboflow: true }),
  /** Full flow — Roboflow YOLO + Claude, photo. */
  roboflowPhoto: (): CostBreakdown =>
    estimateInspectionCost({ frames: FRAME_COUNTS.photo, provider: 'claude', roboflow: true }),
} as const

/** Gross margin at a given sale price (USD). */
export function grossMargin(costUsd: number, salePriceUsd: number): number {
  if (salePriceUsd <= 0) return 0
  return round((salePriceUsd - costUsd) / salePriceUsd, 4)
}

/* ─── Fixed (monthly) costs & breakeven ───────────────────────────────────────
 * The per-inspection AI cost above is only the VARIABLE cost (COGS). It sets the
 * gross margin ceiling but says nothing about whether the business is profitable.
 * Real profitability is driven by fixed monthly burn (team, hosting, tools)
 * spread across volume. These helpers model that.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Monthly fixed burn in PKR. Current: 2-person team + hosting + tools. VERIFY. */
export const MONTHLY_BURN_PKR = 500_000

/** Monthly fixed burn in USD (derived from PKR at USD_TO_PKR). */
export const MONTHLY_BURN_USD = round(MONTHLY_BURN_PKR / USD_TO_PKR, 2)

export interface UnitEconomics {
  /** Sale price per inspection (USD). */
  priceUsd: number
  /** Variable cost per inspection (USD). */
  variableUsd: number
  /** Contribution margin per inspection (price − variable), USD. */
  contributionUsd: number
  /** Gross margin fraction (contribution / price). */
  grossMargin: number
  /** Inspections per month needed to cover fixed burn. */
  breakevenUnits: number
  /** Same breakeven expressed per day (÷30). */
  breakevenPerDay: number
}

/**
 * Contribution-margin breakeven for a single per-inspection price point.
 * breakevenUnits = fixedMonthly / (price − variable).
 */
export function unitEconomics(
  priceUsd: number,
  variableUsd: number,
  fixedMonthlyUsd: number = MONTHLY_BURN_USD,
): UnitEconomics {
  const contribution = priceUsd - variableUsd
  const breakevenUnits = contribution > 0 ? Math.ceil(fixedMonthlyUsd / contribution) : Infinity
  return {
    priceUsd,
    variableUsd,
    contributionUsd: round(contribution),
    grossMargin: grossMargin(variableUsd, priceUsd),
    breakevenUnits,
    breakevenPerDay: Number.isFinite(breakevenUnits) ? Math.ceil(breakevenUnits / 30) : Infinity,
  }
}

/**
 * Fully-loaded (true) cost per inspection at a given monthly volume:
 *   variable + fixedMonthly / volume.
 * This is the number that actually matters early on — it falls toward the
 * variable cost as volume grows.
 */
export function trueCostPerInspection(
  variableUsd: number,
  monthlyVolume: number,
  fixedMonthlyUsd: number = MONTHLY_BURN_USD,
): number {
  if (monthlyVolume <= 0) return Infinity
  return round(variableUsd + fixedMonthlyUsd / monthlyVolume)
}

/** A row in the "true cost vs volume" curve. */
export interface VolumeRow {
  volume: number
  fixedPerUnitUsd: number
  trueCostUsd: number
  trueCostPKR: number
  /** Net margin at the given sale price (can be negative below breakeven). */
  netMargin: number
}

/** Build the true-cost-vs-volume curve for a price + variable cost. */
export function volumeCurve(
  variableUsd: number,
  priceUsd: number,
  volumes: number[] = [100, 500, 1_000, 5_000, 25_000, 100_000],
  fixedMonthlyUsd: number = MONTHLY_BURN_USD,
): VolumeRow[] {
  return volumes.map((volume) => {
    const trueCost = trueCostPerInspection(variableUsd, volume, fixedMonthlyUsd)
    return {
      volume,
      fixedPerUnitUsd: round(fixedMonthlyUsd / volume),
      trueCostUsd: trueCost,
      trueCostPKR: Math.round(trueCost * USD_TO_PKR),
      netMargin: priceUsd > 0 ? round((priceUsd - trueCost) / priceUsd) : 0,
    }
  })
}

/**
 * Breakeven expressed in B2B subscribers, given an average revenue per
 * subscriber per month (e.g. Starter $19, Pro $99) and the per-credit
 * variable cost × credits used. Simplified: ignores variable cost (tiny vs sub).
 */
export function breakevenSubscribers(
  avgMonthlyRevenueUsd: number,
  fixedMonthlyUsd: number = MONTHLY_BURN_USD,
): number {
  if (avgMonthlyRevenueUsd <= 0) return Infinity
  return Math.ceil(fixedMonthlyUsd / avgMonthlyRevenueUsd)
}
