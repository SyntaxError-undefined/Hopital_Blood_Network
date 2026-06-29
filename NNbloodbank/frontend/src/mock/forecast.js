const generateForecastData = (bloodType, days = 14) => {
  const data = []
  const baseLevel = bloodType === 'O-' ? 12 : bloodType === 'A-' ? 8 : 40
  let actual = baseLevel

  for (let i = -7; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    if (i <= 0) {
      actual = Math.max(2, actual + Math.floor(Math.random() * 6) - 4)
      data.push({
        date: dateStr,
        actual,
        predicted: null,
        lower: null,
        upper: null,
      })
    } else {
      const predicted = Math.max(1, baseLevel - i * (bloodType === 'O-' ? 1.2 : 0.8) + Math.random() * 3)
      data.push({
        date: dateStr,
        actual: null,
        predicted: Math.round(predicted * 10) / 10,
        lower: Math.round((predicted - 3) * 10) / 10,
        upper: Math.round((predicted + 2) * 10) / 10,
      })
    }
  }
  return data
}

export const forecastData = {
  'O-': {
    bloodType: 'O-',
    confidence: 87,
    criticalInHours: 36,
    riskLevel: 'critical',
    currentStock: 12,
    predictedMin: 3,
    predictedDate: '2026-06-28',
    trend: 'decreasing',
    chartData: generateForecastData('O-'),
    aiInsight:
      'O- blood stock is projected to reach critical levels within 36 hours based on current consumption rate of 2.1 units/day and scheduled surgeries. Immediate transfer from Kokilaben Hospital (15 units available) or donor drive recommended.',
    historicalTrend: [
      { month: 'Jan', usage: 28, received: 32 },
      { month: 'Feb', usage: 25, received: 30 },
      { month: 'Mar', usage: 32, received: 28 },
      { month: 'Apr', usage: 30, received: 35 },
      { month: 'May', usage: 35, received: 30 },
      { month: 'Jun', usage: 38, received: 25 },
    ],
  },
  'A+': {
    bloodType: 'A+',
    confidence: 92,
    criticalInHours: null,
    riskLevel: 'healthy',
    currentStock: 38,
    predictedMin: 28,
    predictedDate: null,
    trend: 'stable',
    chartData: generateForecastData('A+'),
    aiInsight:
      'A+ inventory levels remain stable with adequate buffer for the next 14 days. Current stock covers projected demand with 22% safety margin.',
    historicalTrend: [
      { month: 'Jan', usage: 45, received: 50 },
      { month: 'Feb', usage: 42, received: 48 },
      { month: 'Mar', usage: 48, received: 52 },
      { month: 'Apr', usage: 44, received: 46 },
      { month: 'May', usage: 46, received: 50 },
      { month: 'Jun', usage: 43, received: 45 },
    ],
  },
  'B+': {
    bloodType: 'B+',
    confidence: 89,
    criticalInHours: 120,
    riskLevel: 'warning',
    currentStock: 52,
    predictedMin: 18,
    predictedDate: '2026-07-02',
    trend: 'decreasing',
    chartData: generateForecastData('B+'),
    aiInsight:
      'B+ stock shows gradual decline. Three major surgeries scheduled next week may accelerate depletion. Consider proactive transfer from Nanavati Hospital.',
    historicalTrend: [
      { month: 'Jan', usage: 55, received: 60 },
      { month: 'Feb', usage: 52, received: 58 },
      { month: 'Mar', usage: 58, received: 55 },
      { month: 'Apr', usage: 54, received: 62 },
      { month: 'May', usage: 60, received: 55 },
      { month: 'Jun', usage: 56, received: 52 },
    ],
  },
}

export const allForecasts = Object.values(forecastData)

export const recentPredictions = [
  { id: 'pred-001', bloodType: 'O-', date: '2026-06-26', prediction: 'Critical in 36h', confidence: 87, outcome: 'pending' },
  { id: 'pred-002', bloodType: 'A-', date: '2026-06-25', prediction: 'Below threshold', confidence: 91, outcome: 'confirmed' },
  { id: 'pred-003', bloodType: 'B+', date: '2026-06-24', prediction: 'Stable for 14 days', confidence: 89, outcome: 'confirmed' },
  { id: 'pred-004', bloodType: 'AB-', date: '2026-06-23', prediction: 'Expiry risk', confidence: 84, outcome: 'confirmed' },
  { id: 'pred-005', bloodType: 'O+', date: '2026-06-22', prediction: 'Adequate stock', confidence: 93, outcome: 'confirmed' },
]

export const trendExplanations = {
  decreasing: 'Consumption rate exceeds incoming supply. Scheduled surgeries and emergency demand are accelerating depletion.',
  stable: 'Supply and demand are balanced. Current stock levels are projected to remain within safe operating margins.',
  increasing: 'Recent donor drives and incoming transfers are building buffer stock above baseline levels.',
}
