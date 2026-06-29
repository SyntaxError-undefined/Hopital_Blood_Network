import { apiGet, haversineKm, normalizeBackendStatus } from '@/services/api'

const statusOverrides = new Map()

async function hospitalLookup() {
  const hospitals = await apiGet('/hospitals')
  return new Map(hospitals.map((hospital) => [hospital.id, hospital]))
}

function mapTransfer(item, hospitals) {
  const from = hospitals.get(item.from_hospital_id)
  const to = hospitals.get(item.to_hospital_id)
  const fromCoordinates = from ? [from.lat, from.lng] : null
  const toCoordinates = to ? [to.lat, to.lng] : null
  const id = String(item.suggestion_id)
  return {
    id,
    fromHospital: {
      id: item.from_hospital_id,
      name: item.from_hospital_name,
      location: from?.city || 'Network',
    },
    toHospital: {
      id: item.to_hospital_id,
      name: item.to_hospital_name,
      location: to?.city || 'Network',
    },
    bloodType: item.blood_type,
    units: item.quantity,
    distance: haversineKm(fromCoordinates, toCoordinates),
    expiryHours: Math.max(0, item.days_to_expiry * 24),
    expiryDays: item.days_to_expiry,
    urgency: item.urgency,
    status: statusOverrides.get(id) || normalizeBackendStatus(item.status),
    aiScore: Math.round((item.forecast_confidence || 0) * 100),
    reason: item.reason,
    createdAt: new Date().toISOString(),
    estimatedArrival: 'Network dispatch',
    sourceSurplusUnits: item.source_surplus_units,
    currentStock: item.current_stock,
    thresholdUsed: item.threshold_used,
    earliestExpiryDate: item.earliest_expiry_date,
  }
}

export async function getTransferSuggestions() {
  const [response, hospitals] = await Promise.all([
    apiGet('/transfers/suggestions'),
    hospitalLookup(),
  ])
  return response.suggestions.map((item) => mapTransfer(item, hospitals))
}

export async function getTransferById(id) {
  const suggestions = await getTransferSuggestions()
  const transfer = suggestions.find((t) => String(t.id) === String(id))
  if (!transfer) return null
  const details = {
    fromStock: { total: transfer.sourceSurplusUnits || transfer.units },
    toStock: { total: transfer.currentStock },
    forecast: `${transfer.bloodType} destination threshold ${transfer.thresholdUsed}; recommendation generated from NN risk plus rule-based matching.`,
    timeline: [
      { step: 'Request Initiated', time: 'Pending', status: 'pending' },
      { step: 'Approval', time: 'Pending', status: 'pending' },
      { step: 'In Transit', time: 'Pending', status: 'pending' },
      { step: 'Delivery', time: 'Pending', status: 'pending' },
    ],
    expectedImpact: `Moves ${transfer.units} units before expiry on ${transfer.earliestExpiryDate}.`,
  }
  return { ...transfer, ...details }
}

export async function acceptTransfer(id) {
  statusOverrides.set(String(id), 'accepted')
  const transfer = (await getTransferSuggestions()).find((t) => String(t.id) === String(id))
  if (!transfer) return null
  return { ...transfer, status: 'accepted' }
}

export async function rejectTransfer(id) {
  statusOverrides.set(String(id), 'rejected')
  const transfer = (await getTransferSuggestions()).find((t) => String(t.id) === String(id))
  if (!transfer) return null
  return { ...transfer, status: 'rejected' }
}
