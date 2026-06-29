import { apiGet } from '@/services/api'
import { getInventoryPageData } from '@/services/inventory'

export async function getDashboardStats() {
  const [inventory, forecastResponse, transferResponse] = await Promise.all([
    getInventoryPageData(),
    apiGet('/forecast/network'),
    apiGet('/transfers/suggestions'),
  ])
  return {
    totalBloodUnits: { value: inventory.summary.totalUnits, change: 0, trend: 'stable' },
    criticalAlerts: {
      value: forecastResponse.forecasts.filter((item) => item.predicted_critical).length,
      change: 0,
      trend: 'stable',
    },
    expiringSoon: { value: inventory.summary.totalExpiringSoon, change: 0, trend: 'stable' },
    incomingTransfers: { value: transferResponse.count, change: 0, trend: 'stable' },
  }
}

export async function getRecentActivity() {
  const transferResponse = await apiGet('/transfers/suggestions')
  return transferResponse.suggestions.slice(0, 6).map((item) => ({
    id: `act-${item.suggestion_id}`,
    type: 'transfer',
    message: `${item.quantity} ${item.blood_type} units recommended from ${item.from_hospital_name} to ${item.to_hospital_name}`,
    timestamp: new Date().toISOString(),
  }))
}

export async function getMiniForecast() {
  const [forecastResponse, hospitals] = await Promise.all([
    apiGet('/forecast/network'),
    apiGet('/hospitals'),
  ])
  const critical = forecastResponse.forecasts
    .filter((item) => item.predicted_critical)
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0]
  if (!critical) {
    return {
      bloodType: 'O+',
      currentStock: 0,
      criticalInHours: null,
      trend: 'stable',
      chartData: [],
    }
  }
  const stock = await apiGet(`/hospitals/${critical.hospital_id}/stock`)
  const currentStock = stock.find((item) => item.blood_type === critical.blood_type)?.count || 0
  return {
    bloodType: critical.blood_type,
    currentStock,
    criticalInHours: 48,
    trend: 'decreasing',
    hospitalName: hospitals.find((hospital) => hospital.id === critical.hospital_id)?.name,
    chartData: [
      { day: 'Now', value: currentStock },
      { day: '+12h', value: Math.max(0, currentStock - 2) },
      { day: '+24h', value: Math.max(0, currentStock - 4) },
      { day: '+36h', value: Math.max(0, currentStock - 6) },
      { day: '+48h', value: Math.max(0, currentStock - 8) },
    ],
  }
}

export async function getInventorySummary() {
  const inventory = await getInventoryPageData()
  return inventory.summary
}

export async function getDashboardData() {
  const [stats, activity, forecast, inventory] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getMiniForecast(),
    getInventorySummary(),
  ])
  return { stats, activity, forecast, inventory }
}
