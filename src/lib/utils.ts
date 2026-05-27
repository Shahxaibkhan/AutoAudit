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
    case 'excellent': return 'text-green-600'
    case 'good': return 'text-blue-600'
    case 'fair': return 'text-yellow-600'
    case 'poor': return 'text-red-600'
    default: return 'text-gray-600'
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
