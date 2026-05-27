import Anthropic from '@anthropic-ai/sdk'
import type { AIAnalysisResult, ComparisonResult } from '@/types'

let _client: Anthropic | null = null
function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const DAMAGE_ANALYSIS_PROMPT = `You are an expert automotive damage inspector. Analyze this car image and identify any damage.

Return a JSON object with this exact structure:
{
  "overallCondition": "excellent" | "good" | "fair" | "poor",
  "damages": [
    {
      "type": "scratch" | "dent" | "crack" | "paint_chip" | "broken" | "missing" | "other",
      "severity": "minor" | "moderate" | "severe",
      "location": "specific location on the car (e.g., front bumper, driver door, rear quarter panel)",
      "description": "clear description of the damage",
      "estimatedCost": number in USD (realistic repair estimate)
    }
  ],
  "summary": "overall condition summary in 1-2 sentences",
  "recommendations": ["actionable recommendation 1", "recommendation 2"],
  "totalEstimatedCost": total repair cost in USD
}

If no damage is visible, return an empty damages array and "excellent" condition.
Respond with ONLY the JSON object, no other text.`

const COMPARISON_PROMPT = `You are an expert automotive damage inspector comparing pre-rental and post-rental car images.

Pre-rental inspection damages (existing):
{PRE_DAMAGES}

Now analyze the post-rental image and identify:
1. Any NEW damage not present in the pre-rental inspection
2. Any worsening of existing damage

Return a JSON object with this exact structure:
{
  "newDamages": [
    {
      "type": "scratch" | "dent" | "crack" | "paint_chip" | "broken" | "missing" | "other",
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

export async function analyzeCarImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<AIAnalysisResult> {
  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: imageBase64,
            },
          },
          { type: 'text', text: DAMAGE_ANALYSIS_PROMPT },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response format')

  return JSON.parse(jsonMatch[0]) as AIAnalysisResult
}

export async function compareInspections(
  postImageBase64: string,
  preDamages: AIAnalysisResult['damages'],
  mimeType: string = 'image/jpeg'
): Promise<ComparisonResult> {
  const prompt = COMPARISON_PROMPT.replace('{PRE_DAMAGES}', JSON.stringify(preDamages, null, 2))

  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: postImageBase64,
            },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response format')

  return JSON.parse(jsonMatch[0]) as ComparisonResult
}
