import { apiGet, addDaysIso, BLOOD_TYPE_ORDER, CRITICAL_THRESHOLDS } from '@/services/api'

const DATE_RANGES = { '7d': 7, '14d': 14, '30d': 30 }
const trendExplanations = {
  decreasing: 'Current stock is below or approaching the critical threshold. Transfer action is recommended.',
  stable: 'Current network stock is above the configured critical threshold.',
  increasing: 'Incoming stock or transfers are improving the buffer.',
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
  const matching = networkForecast.forecasts
    .filter((item) => item.blood_type === bloodType)
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  const top = matching[0] || networkForecast.forecasts[0]
  const stock = top ? await apiGet(`/hospitals/${top.hospital_id}/stock`) : []
  const currentStock = stock.find((item) => item.blood_type === bloodType)?.count || 0
  const threshold = CRITICAL_THRESHOLDS[bloodType] || top?.threshold_used || 8
  const days = DATE_RANGES[dateRange] || 14
  const projectedDrop = top?.predicted_critical ? Math.max(1, Math.round(currentStock / Math.max(days, 1))) : 0
  const chartData = Array.from({ length: days + 8 }, (_, index) => {
    const offset = index - 7
    const date = addDaysIso(offset)
    if (offset <= 0) {
      return { date, actual: Math.max(0, currentStock + Math.abs(offset)), predicted: null, lower: null, upper: null }
    }
    const predicted = Math.max(0, currentStock - projectedDrop * offset)
    return {
      date,
      actual: null,
      predicted,
      lower: Math.max(0, predicted - 2),
      upper: predicted + 2,
    }
  })
  const riskLevel = top?.predicted_critical ? (currentStock <= threshold ? 'critical' : 'warning') : 'healthy'
  const trend = top?.predicted_critical ? 'decreasing' : 'stable'
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
    predictedMin: Math.min(...chartData.map((item) => item.predicted ?? item.actual ?? currentStock)),
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
