/**
 * AI provider selector — picks Claude or Gemini based on available API keys.
 *
 * Priority: ANTHROPIC_API_KEY → Claude (production)
 *           GOOGLE_AI_KEY     → Gemini 2.5 Flash (free testing)
 *
 * All functions exported here have identical signatures — pipeline.ts imports
 * from this file and never needs to know which backend is active.
 */

import * as claude from './claude'
import * as gemini from './gemini'

function useGemini(): boolean {
  return !process.env.ANTHROPIC_API_KEY && !!process.env.GOOGLE_AI_KEY
}

export function analyzeCarImage(...args: Parameters<typeof claude.analyzeCarImage>) {
  return useGemini() ? gemini.analyzeCarImage(...args) : claude.analyzeCarImage(...args)
}

export function compareInspections(...args: Parameters<typeof claude.compareInspections>) {
  return useGemini() ? gemini.compareInspections(...args) : claude.compareInspections(...args)
}

export function analyzeFrameDirect(...args: Parameters<typeof claude.analyzeFrameDirect>) {
  return useGemini() ? gemini.analyzeFrameDirect(...args) : claude.analyzeFrameDirect(...args)
}

export function identifyPanel(...args: Parameters<typeof claude.identifyPanel>) {
  return useGemini() ? gemini.identifyPanel(...args) : claude.identifyPanel(...args)
}

export function verifyDamage(...args: Parameters<typeof claude.verifyDamage>) {
  return useGemini() ? gemini.verifyDamage(...args) : claude.verifyDamage(...args)
}

export function generateInspectionReport(...args: Parameters<typeof claude.generateInspectionReport>) {
  return useGemini() ? gemini.generateInspectionReport(...args) : claude.generateInspectionReport(...args)
}

export function activeProvider(): 'claude' | 'gemini' {
  return useGemini() ? 'gemini' : 'claude'
}
