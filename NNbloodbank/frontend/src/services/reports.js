import { delay } from '@/utils'
import { reportsData } from '@/mock/reports'

export async function getReportsData(filters = {}) {
  await delay()
  return { ...reportsData, filters }
}

export async function getUsageTrends() {
  await delay()
  return [...reportsData.usageTrends]
}

export async function getBloodTypeDistribution() {
  await delay()
  return [...reportsData.bloodTypeDistribution]
}

export async function getTransferStatistics() {
  await delay()
  return [...reportsData.transferStatistics]
}

export async function getMonthlyAnalytics() {
  await delay()
  return { ...reportsData.monthlyAnalytics }
}

export async function getExpiryTrend() {
  await delay()
  return [...reportsData.expiryTrend]
}

export async function getHospitalComparison() {
  await delay()
  return [...reportsData.hospitalComparison]
}

export async function getForecastAccuracy() {
  await delay()
  return [...reportsData.forecastAccuracy]
}

export async function downloadReport() {
  await delay(800)
  return { success: true, filename: 'jeevansetu-report-jun-2026.pdf' }
}
