import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function severityColor(severity: string) {
  switch (severity) {
    case 'minor': return 'bg-yellow-100 text-yellow-800'
    case 'moderate': return 'bg-orange-100 text-orange-800'
    case 'severe': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function conditionColor(condition: string) {
  switch (condition) {
    case 'excellent': return 'text-emerald-600'
    case 'good': return 'text-teal-600'
    case 'fair': return 'text-amber-600'
    case 'poor': return 'text-red-600'
    default: return 'text-slate-600'
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const AFTER_TYPES = ['POST_RENTAL', 'POST_SALE', 'SHIFT_END', 'POST_CLAIM', 'POST_REPAIR', 'LEASE_END']

export function inspectionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PRE_RENTAL: 'Pre-rental',   POST_RENTAL: 'Post-rental',
    PRE_SALE: 'Pre-sale',       POST_SALE: 'Post-sale',
    SHIFT_START: 'Shift start', SHIFT_END: 'Shift end',
    PRE_CLAIM: 'Before claim',  POST_CLAIM: 'After assessment',
    PRE_REPAIR: 'Before repair',POST_REPAIR: 'After repair',
    LEASE_START: 'Lease start', LEASE_END: 'Lease end',
  }
  return labels[type] ?? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export function inspectionTypeBadge(type: string): string {
  return AFTER_TYPES.includes(type)
    ? 'bg-indigo-50 text-indigo-700'
    : 'bg-teal-50 text-teal-700'
}

export function inspectionTypeBarColor(type: string): string {
  return AFTER_TYPES.includes(type) ? 'bg-indigo-200' : 'bg-teal-200'
}

export function inspectionPartyLabel(type: string): string {
  if (['PRE_SALE', 'POST_SALE'].includes(type)) return 'Buyer'
  if (['SHIFT_START', 'SHIFT_END'].includes(type)) return 'Driver'
  if (['PRE_CLAIM', 'POST_CLAIM'].includes(type)) return 'Claimant'
  if (['PRE_REPAIR', 'POST_REPAIR'].includes(type)) return 'Customer'
  if (['LEASE_START', 'LEASE_END'].includes(type)) return 'Lessee'
  return 'Renter'
}

export function inspectionPeriodLabels(type: string): { start: string; end: string } {
  if (['PRE_SALE', 'POST_SALE'].includes(type)) return { start: 'Listing date', end: 'Sale date' }
  if (['SHIFT_START', 'SHIFT_END'].includes(type)) return { start: 'Shift start', end: 'Shift end' }
  if (['PRE_CLAIM', 'POST_CLAIM'].includes(type)) return { start: 'Policy start', end: 'Claim date' }
  if (['PRE_REPAIR', 'POST_REPAIR'].includes(type)) return { start: 'Drop-off date', end: 'Pick-up date' }
  if (['LEASE_START', 'LEASE_END'].includes(type)) return { start: 'Lease start', end: 'Lease end' }
  return { start: 'Rental start', end: 'Rental end' }
}
