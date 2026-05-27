export type InspectionType = 'PRE_RENTAL' | 'POST_RENTAL'
export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type DamageType = 'scratch' | 'dent' | 'crack' | 'paint_chip' | 'broken' | 'missing' | 'other'
export type DamageSeverity = 'minor' | 'moderate' | 'severe'
export type ImageAngle = 'front' | 'rear' | 'left' | 'right' | 'left_front' | 'right_front' | 'left_rear' | 'right_rear' | 'interior' | 'roof' | 'other'

export interface DamageItem {
  type: DamageType
  severity: DamageSeverity
  location: string
  description: string
  estimatedCost?: number
  isNew?: boolean
}

export interface AIAnalysisResult {
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor'
  damages: DamageItem[]
  summary: string
  recommendations: string[]
  totalEstimatedCost: number
}

export interface ComparisonResult {
  newDamages: DamageItem[]
  existingDamages: DamageItem[]
  summary: string
  hasNewDamage: boolean
  totalNewDamageCost: number
}
