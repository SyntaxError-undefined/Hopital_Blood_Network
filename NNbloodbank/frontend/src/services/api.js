const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export const CRITICAL_THRESHOLDS = {
  'O+': 18,
  'B+': 14,
  'A+': 12,
  'AB+': 6,
  'O-': 5,
  'B-': 4,
  'A-': 4,
  'AB-': 2,
}

export const BLOOD_TYPE_ORDER = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }
  return response.json()
}

export function todayIso() {
  return new Date().toISOString().split('T')[0]
}

export function addDaysIso(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export function statusFromCounts(bloodTypes = {}, criticalAlerts = []) {
  if (criticalAlerts.length > 0) return 'critical'
  const values = Object.entries(bloodTypes)
  if (values.some(([type, count]) => count <= (CRITICAL_THRESHOLDS[type] || 8))) return 'warning'
  return 'healthy'
}

export function normalizeBackendStatus(status) {
  if (status === 'suggested') return 'pending'
  return status || 'pending'
}

export function haversineKm(a, b) {
  if (!a || !b) return 0
  const toRad = (value) => (value * Math.PI) / 180
  const radius = 6371
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * radius * Math.asin(Math.sqrt(h)) * 10) / 10
}
