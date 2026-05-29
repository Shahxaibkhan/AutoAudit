export interface YoloDetection {
  class: string
  confidence: number
  x: number       // center x (pixels)
  y: number       // center y (pixels)
  width: number   // box width (pixels)
  height: number  // box height (pixels)
}

export function roboflowConfigured(): boolean {
  return !!(process.env.ROBOFLOW_API_KEY && process.env.ROBOFLOW_MODEL_ID)
}

/** Run YOLO damage detection on a single image (base64, no data-URI prefix). */
export async function detectDamage(imageBase64: string): Promise<YoloDetection[]> {
  if (!roboflowConfigured()) return []

  const modelId = process.env.ROBOFLOW_MODEL_ID!
  const version = process.env.ROBOFLOW_MODEL_VERSION || '1'
  const apiKey = process.env.ROBOFLOW_API_KEY!
  const confidence = process.env.ROBOFLOW_CONFIDENCE || '40'
  const overlap = process.env.ROBOFLOW_OVERLAP || '30'

  const url = `https://detect.roboflow.com/${modelId}/${version}?api_key=${apiKey}&confidence=${confidence}&overlap=${overlap}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: imageBase64,
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.predictions ?? []) as YoloDetection[]
  } catch {
    return []
  }
}

/** Run YOLO on multiple images in parallel batches. */
export async function detectDamageBatch(
  imageBase64s: string[],
  batchSize = 5,
): Promise<YoloDetection[][]> {
  const results: YoloDetection[][] = []
  for (let i = 0; i < imageBase64s.length; i += batchSize) {
    const batch = imageBase64s.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(detectDamage))
    results.push(...batchResults)
  }
  return results
}
