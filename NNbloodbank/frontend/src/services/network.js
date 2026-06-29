import { apiGet, BLOOD_TYPE_ORDER, haversineKm, statusFromCounts } from '@/services/api'
import { getSelectedHospitalId } from '@/services/auth'

export async function getHospitals() {
  const [hospitals, forecastResponse] = await Promise.all([
    apiGet('/hospitals'),
    apiGet('/forecast/network'),
  ])

  const selectedId = getSelectedHospitalId()
  const currentBackendHospital =
    hospitals.find((hospital) => String(hospital.id) === String(selectedId)) ||
    hospitals[0]
  const currentCoordinates = currentBackendHospital
    ? [currentBackendHospital.lat, currentBackendHospital.lng]
    : null
  const stockPairs = await Promise.all(
    hospitals.map(async (hospital) => {
      const stock = await apiGet(`/hospitals/${hospital.id}/stock`)
      return [hospital.id, stock]
    })
  )
  const stockByHospital = new Map(stockPairs)

  return hospitals.map((hospital) => {
    const stock = stockByHospital.get(hospital.id) || []
    const bloodTypes = Object.fromEntries(
      BLOOD_TYPE_ORDER.map((type) => [
        type,
        stock.find((item) => item.blood_type === type)?.count || 0,
      ])
    )
    const criticalAlerts = forecastResponse.forecasts
      .filter((item) => item.hospital_id === hospital.id && item.predicted_critical)
      .map((item) => `${item.blood_type} predicted critical (${Math.round((item.confidence || 0) * 100)}%)`)

    return {
      id: hospital.id,
      name: hospital.name,
      location: hospital.city,
      city: hospital.city,
      coordinates: [hospital.lat, hospital.lng],
      status: statusFromCounts(bloodTypes, criticalAlerts),
      totalUnits: Object.values(bloodTypes).reduce((total, value) => total + value, 0),
      bloodTypes,
      contact: 'Network blood bank',
      distance: haversineKm(currentCoordinates, [hospital.lat, hospital.lng]),
      criticalAlerts,
    }
  })
}

export async function getCurrentHospital() {
  const hospitals = await getHospitals()
  const selectedId = getSelectedHospitalId()
  return hospitals.find((hospital) => String(hospital.id) === String(selectedId)) || hospitals[0]
}

export async function getHospitalById(id) {
  const hospitals = await getHospitals()
  return hospitals.find((hospital) => String(hospital.id) === String(id)) || null
}

export async function getNetworkData() {
  const hospitals = await getHospitals()
  return {
    hospitals,
    currentHospital: await getCurrentHospital(),
    legend: [
      { status: 'healthy', label: 'Healthy Stock', color: '#2E7D32' },
      { status: 'warning', label: 'Low Stock', color: '#FB8C00' },
      { status: 'critical', label: 'Critical', color: '#D32F2F' },
    ],
  }
}
