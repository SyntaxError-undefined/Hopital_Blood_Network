export const dashboardStats = {
  totalBloodUnits: { value: 198, change: 5.2, trend: 'up' },
  criticalAlerts: { value: 3, change: -1, trend: 'down' },
  expiringSoon: { value: 26, change: 8.3, trend: 'up' },
  incomingTransfers: { value: 2, change: 0, trend: 'stable' },
}

export const recentActivity = [
  { id: 'act-001', type: 'transfer', message: 'Transfer of 8 O- units initiated from Aditya Birla Memorial Hospital', timestamp: '2026-06-26T10:30:00Z', icon: 'truck' },
  { id: 'act-002', type: 'alert', message: 'Critical alert triggered for O- blood type', timestamp: '2026-06-26T09:45:00Z', icon: 'alert-triangle' },
  { id: 'act-003', type: 'inventory', message: '12 units of B+ added to inventory from donor drive', timestamp: '2026-06-26T08:15:00Z', icon: 'plus' },
  { id: 'act-004', type: 'forecast', message: 'AI forecast updated: O- critical in 36 hours', timestamp: '2026-06-26T07:30:00Z', icon: 'trending-down' },
  { id: 'act-005', type: 'transfer', message: 'Transfer completed: 5 B- units to YCM Hospital', timestamp: '2026-06-25T16:45:00Z', icon: 'check' },
  { id: 'act-006', type: 'inventory', message: '3 units of AB- marked as expiring soon', timestamp: '2026-06-25T14:20:00Z', icon: 'clock' },
]

export const miniForecast = {
  bloodType: 'O-',
  currentStock: 12,
  criticalInHours: 36,
  trend: 'decreasing',
  chartData: [
    { day: 'Mon', value: 18 },
    { day: 'Tue', value: 16 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 14 },
    { day: 'Fri', value: 13 },
    { day: 'Sat', value: 12 },
    { day: 'Sun', value: 10 },
  ],
}
