import { apiGet, addDaysIso, BLOOD_TYPE_ORDER, CRITICAL_THRESHOLDS } from '@/services/api'
import { getSelectedHospitalId } from '@/services/auth'

const DATE_RANGES = { '7d': 7, '14d': 14, '30d': 30 }
const trendExplanations = {
  decreasing: 'Current stock is below or approaching the critical threshold. Transfer action is recommended.',
  stable: 'Current network stock is above the configured critical threshold.',
  increasing: 'Incoming stock or transfers are improving the buffer.',
}

function stockRiskLevel(currentStock, threshold) {
  if (currentStock < threshold) return 'critical'
  if (currentStock === threshold) return 'warning'
  return 'healthy'
}

export async function getForecasts() {
  const response = await apiGet('/forecast/network')
  return response.forecasts.map((item) => ({
    id: `${item.hospital_id}-${item.blood_type}`,
    hospitalId: item.hospital_id,
    hospitalName: item.hospital_name,
    bloodType: item.blood_type,
    confidence: Math.round((item.confidence || 0) * 100),
    riskLevel: item.predicted_critical ? 'critical' : 'healthy',
    threshold: item.threshold_used,
    prediction: item.predicted_critical ? 'Critical within 48h' : 'Stable for 48h',
  }))
}

export async function getForecastByBloodType(bloodType) {
  return getForecastData(bloodType)
}

export async function getForecastData(bloodType = 'O-', dateRange = '14d') {
  const [networkForecast, hospitals] = await Promise.all([
    apiGet('/forecast/network'),
    apiGet('/hospitals'),
  ])
  const selectedHospitalId = getSelectedHospitalId() || hospitals[0]?.id
  const matching = networkForecast.forecasts
    .filter((item) => item.blood_type === bloodType && String(item.hospital_id) === String(selectedHospitalId))
    .sort((a, b) => Number(b.predicted_critical) - Number(a.predicted_critical) || (b.confidence || 0) - (a.confidence || 0))
  const top = matching[0] || networkForecast.forecasts.find((item) => item.blood_type === bloodType) || networkForecast.forecasts[0]
  const days = DATE_RANGES[dateRange] || 14
  const [stock, history] = top
    ? await Promise.all([
        apiGet(`/hospitals/${top.hospital_id}/stock`),
        apiGet(`/hospitals/${top.hospital_id}/stock/history?days=${days}&blood_type=${encodeURIComponent(bloodType)}`),
      ])
    : [[], []]
  const currentStock = stock.find((item) => item.blood_type === bloodType)?.count || 0
  const threshold = CRITICAL_THRESHOLDS[bloodType] || top?.threshold_used || 8
  const actualHistory = history.map((item) => ({
    date: item.date,
    actual: item.count,
    predicted: null,
    lower: null,
    upper: null,
  }))
  const historyCounts = history.map((item) => item.count)
  const deltas = historyCounts.slice(1).map((count, index) => count - historyCounts[index])
  const drops = deltas.filter((delta) => delta < 0).map((delta) => Math.abs(delta))
  const restocks = deltas.filter((delta) => delta > 0)
  const avgDailyDrop = drops.length ? drops.reduce((sum, value) => sum + value, 0) / drops.length : 0.6
  const avgRestock = restocks.length ? restocks.reduce((sum, value) => sum + value, 0) / restocks.length : 3
  const volatility = Math.max(
    1,
    deltas.length
      ? deltas.reduce((sum, delta) => sum + Math.abs(delta), 0) / deltas.length
      : 1
  )
  const projectedRows = []
  let projectedStock = currentStock
  for (let offset = 1; offset <= 8; offset += 1) {
    const date = addDaysIso(offset)
    const riskPressure = top?.predicted_critical ? 1.35 : currentStock <= threshold + 4 ? 1.05 : 0.65
    const demandWave = Math.sin((offset + Number(top?.hospital_id || 1)) * 1.7) * volatility * 0.35
    const plannedRestock = !top?.predicted_critical && offset % 5 === 0 ? avgRestock * 0.55 : 0
    projectedStock = Math.max(0, projectedStock - avgDailyDrop * riskPressure - demandWave + plannedRestock)
    const predicted = Math.round(projectedStock * 10) / 10
    const intervalWidth = Math.max(2, Math.round((1 - (top?.confidence || 0.72)) * 10 + volatility))
    projectedRows.push({
      date,
      actual: null,
      predicted,
      lower: Math.max(0, Math.round((predicted - intervalWidth) * 10) / 10),
      upper: Math.round((predicted + intervalWidth) * 10) / 10,
    })
  }
  const chartData = [...actualHistory, ...projectedRows]
  const projectedValues = projectedRows.map((item) => item.predicted).filter((value) => value != null)
  const projectedMin = projectedValues.length ? Math.min(...projectedValues) : currentStock
  const riskLevel = stockRiskLevel(currentStock, threshold)
  const trend = projectedMin < currentStock - 1 ? 'decreasing' : projectedMin > currentStock + 1 ? 'increasing' : 'stable'
  const allRecentPredictions = networkForecast.forecasts
    .filter((item) => item.status === 'ok')
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 8)
    .map((item, index) => ({
      id: `pred-${index + 1}`,
      bloodType: item.blood_type,
      date: addDaysIso(0),
      prediction: item.predicted_critical ? 'Critical within 48h' : 'Stable for 48h',
      confidence: Math.round((item.confidence || 0) * 100),
      outcome: 'pending',
    }))

  return {
    bloodType,
    confidence: Math.round((top?.confidence || 0) * 100),
    criticalInHours: top?.predicted_critical ? 48 : null,
    riskLevel,
    currentStock,
    predictedMin: projectedMin,
    predictedDate: top?.predicted_critical ? addDaysIso(2) : null,
    trend,
    chartData,
    aiInsight: top
      ? `${top.hospital_name} is ${top.predicted_critical ? 'predicted critical' : 'stable'} for ${bloodType} with ${Math.round((top.confidence || 0) * 100)}% model confidence.`
      : 'No forecast data available.',
    historicalTrend: [
      { month: 'Jan', usage: 30, received: 34 },
      { month: 'Feb', usage: 34, received: 36 },
      { month: 'Mar', usage: 38, received: 35 },
      { month: 'Apr', usage: 32, received: 37 },
      { month: 'May', usage: 40, received: 34 },
      { month: 'Jun', usage: 42, received: 31 },
    ],
    hospitalName: hospitals.find((hospital) => hospital.id === top?.hospital_id)?.name,
    recentPredictions: allRecentPredictions.filter((item) => item.bloodType === bloodType).slice(0, 5),
    allRecentPredictions,
    trendExplanation: trendExplanations[trend] || trendExplanations.stable,
    criticalThreshold: threshold,
    dateRange,
  }
}
