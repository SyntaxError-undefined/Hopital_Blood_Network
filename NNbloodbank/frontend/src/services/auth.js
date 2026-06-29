import { delay } from '@/utils'
import { apiGet } from '@/services/api'

export function getSelectedHospitalId() {
  return localStorage.getItem('jeevansetu_hospital_id')
}

function fallbackHospital(hospital) {
  if (!hospital) return null
  return {
    id: hospital.id,
    name: hospital.name,
    location: hospital.city,
    city: hospital.city,
    state: 'India',
    email: `bloodbank-${hospital.id}@jeevansetu.demo`,
    phone: 'Network blood bank',
    address: `${hospital.city}, India`,
    license: `JS-BB-${hospital.id}`,
    coordinates: [hospital.lat, hospital.lng],
    type: 'Connected Hospital',
    beds: 300,
    bloodBankCapacity: 500,
  }
}

async function selectedHospital() {
  const hospitals = await apiGet('/hospitals')
  const selectedId = getSelectedHospitalId()
  const hospital =
    hospitals.find((item) => String(item.id) === String(selectedId)) ||
    hospitals[0]
  return fallbackHospital(hospital)
}

export async function getProfile() {
  const hospital = await selectedHospital()
  return {
    name: localStorage.getItem('jeevansetu_user_name') || 'Blood Bank Manager',
    role: 'Blood Bank Manager',
    email: localStorage.getItem('jeevansetu_email') || `manager@hospital-${hospital?.id || 1}.demo`,
    avatar: null,
    hospital,
    preferences: {
      emailNotifications: true,
      smsAlerts: true,
      criticalAlertsOnly: false,
      darkMode: false,
      language: 'en',
      timezone: 'Asia/Kolkata',
    },
  }
}

export async function updateProfile(data) {
  await delay(500)
  const profile = await getProfile()
  return { ...profile, ...data }
}

export async function updateHospitalInfo(data) {
  await delay(500)
  const hospital = await selectedHospital()
  return { ...hospital, ...data }
}

export async function changePassword() {
  await delay(500)
  return { success: true, message: 'Password updated successfully' }
}

export async function updatePreferences(preferences) {
  await delay(500)
  const profile = await getProfile()
  return {
    ...profile,
    preferences: { ...profile.preferences, ...preferences },
  }
}

export async function login(credentials) {
  await delay(800)
  if (credentials.email && credentials.password) {
    if (credentials.hospitalId) {
      localStorage.setItem('jeevansetu_hospital_id', String(credentials.hospitalId))
    }
    localStorage.setItem('jeevansetu_email', credentials.email)
    localStorage.setItem('jeevansetu_user_name', credentials.name || 'Blood Bank Manager')
    return {
      success: true,
      user: await getProfile(),
      token: 'mock-jwt-token',
    }
  }
  return { success: false, message: 'Invalid credentials' }
}
