import { apiGet, BLOOD_TYPE_ORDER } from '@/services/api'

const bucketKeys = ['days0To3', 'days4To7', 'days8To14', 'daysOver14']

function statusForItem(item) {
  if (item.status === 'critical') return 'critical'
  if (item.status === 'high') return 'high'
  if (item.status === 'moderate') return 'moderate'
  return 'healthy'
}

function mapInventoryItem(item, index) {
  const buckets = {
    days0To3: item.expiry_buckets.days_0_3,
    days4To7: item.expiry_buckets.days_4_7,
    days8To14: item.expiry_buckets.days_8_14,
    daysOver14: item.expiry_buckets.days_over_14,
  }
  const expiringSoon = buckets.days0To3 + buckets.days4To7
  const status = statusForItem(item)

  return {
    id: `inv-${index + 1}`,
    bloodType: item.blood_type,
    available: item.available_units,
    reserved: item.reserved_units,
    expiryBuckets: buckets,
    days0To3: buckets.days0To3,
    days4To7: buckets.days4To7,
    days8To14: buckets.days8To14,
    daysOver14: buckets.daysOver14,
    expiringSoon,
    oldestExpiryDate: item.oldest_expiry_date,
    status,
  }
}

function percent(part, whole) {
  if (!whole) return 0
  return Math.round((part / whole) * 1000) / 10
}

export async function getInventoryPageData() {
  const response = await apiGet('/inventory/expiry')
  const items = response.items
    .map(mapInventoryItem)
    .sort((a, b) => BLOOD_TYPE_ORDER.indexOf(a.bloodType) - BLOOD_TYPE_ORDER.indexOf(b.bloodType))

  const summary = {
    asOf: response.as_of,
    totalUnits: response.summary.total_units,
    totalReserved: response.summary.reserved_units,
    totalExpiringSoon: response.summary.expiring_within_7_days,
    criticalUnits: response.summary.critical_units,
    highUnits: response.summary.high_units,
    moderateUnits: response.summary.moderate_units,
    healthyUnits: response.summary.healthy_units,
    byBloodType: items.map(({ bloodType, available, reserved, expiringSoon, status }) => ({
      bloodType,
      available,
      reserved,
      expiringSoon,
      status: status === 'high' || status === 'moderate' ? 'warning' : status,
    })),
  }

  const expiryCards = [
    {
      key: 'total',
      label: 'Total Blood Units',
      value: summary.totalUnits,
      sublabel: 'Available across all blood types',
      status: 'default',
    },
    {
      key: 'critical',
      label: 'Critical (0-3 days)',
      value: summary.criticalUnits,
      sublabel: `${percent(summary.criticalUnits, summary.totalUnits)}% of total`,
      status: 'critical',
    },
    {
      key: 'high',
      label: 'High (4-7 days)',
      value: summary.highUnits,
      sublabel: `${percent(summary.highUnits, summary.totalUnits)}% of total`,
      status: 'high',
    },
    {
      key: 'moderate',
      label: 'Moderate (8-14 days)',
      value: summary.moderateUnits,
      sublabel: `${percent(summary.moderateUnits, summary.totalUnits)}% of total`,
      status: 'moderate',
    },
    {
      key: 'healthy',
      label: 'Healthy (>14 days)',
      value: summary.healthyUnits,
      sublabel: `${percent(summary.healthyUnits, summary.totalUnits)}% of total`,
      status: 'healthy',
    },
  ]

  const overview = [
    { key: 'critical', label: 'Critical (0-3 days)', units: summary.criticalUnits, status: 'critical' },
    { key: 'high', label: 'High (4-7 days)', units: summary.highUnits, status: 'high' },
    { key: 'moderate', label: 'Moderate (8-14 days)', units: summary.moderateUnits, status: 'moderate' },
    { key: 'healthy', label: 'Healthy (>14 days)', units: summary.healthyUnits, status: 'healthy' },
  ].map((entry) => ({
    ...entry,
    percent: percent(entry.units, summary.totalUnits),
  }))

  return {
    items,
    summary,
    expiryCards,
    overview,
    timeline: [
      { key: 'days0To3', label: '0-3 days', value: summary.criticalUnits, status: 'critical' },
      { key: 'days4To7', label: '4-7 days', value: summary.highUnits, status: 'high' },
      { key: 'days8To14', label: '8-14 days', value: summary.moderateUnits, status: 'moderate' },
      { key: 'daysOver14', label: '>14 days', value: summary.healthyUnits, status: 'healthy' },
    ],
    bucketKeys,
  }
}

export async function getInventory() {
  const data = await getInventoryPageData()
  return data.items
}

export async function getInventoryItem(id) {
  const items = await getInventory()
  return items.find((item) => item.id === id) || null
}
