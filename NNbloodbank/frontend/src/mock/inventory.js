export const inventoryItems = [
  { id: 'inv-001', bloodType: 'O+', available: 45, reserved: 8, expiringSoon: 5, status: 'healthy', expiryDate: '2026-07-15', lastUpdated: '2026-06-26T08:30:00Z', donorType: 'Voluntary', collectionDate: '2026-06-20' },
  { id: 'inv-002', bloodType: 'O-', available: 12, reserved: 4, expiringSoon: 3, status: 'warning', expiryDate: '2026-07-02', lastUpdated: '2026-06-26T07:15:00Z', donorType: 'Replacement', collectionDate: '2026-06-18' },
  { id: 'inv-003', bloodType: 'A+', available: 38, reserved: 6, expiringSoon: 4, status: 'healthy', expiryDate: '2026-07-18', lastUpdated: '2026-06-25T16:45:00Z', donorType: 'Voluntary', collectionDate: '2026-06-22' },
  { id: 'inv-004', bloodType: 'A-', available: 8, reserved: 2, expiringSoon: 2, status: 'critical', expiryDate: '2026-06-30', lastUpdated: '2026-06-26T09:00:00Z', donorType: 'Voluntary', collectionDate: '2026-06-15' },
  { id: 'inv-005', bloodType: 'B+', available: 52, reserved: 10, expiringSoon: 6, status: 'healthy', expiryDate: '2026-07-20', lastUpdated: '2026-06-26T06:30:00Z', donorType: 'Replacement', collectionDate: '2026-06-23' },
  { id: 'inv-006', bloodType: 'B-', available: 15, reserved: 3, expiringSoon: 2, status: 'warning', expiryDate: '2026-07-05', lastUpdated: '2026-06-25T14:20:00Z', donorType: 'Voluntary', collectionDate: '2026-06-19' },
  { id: 'inv-007', bloodType: 'AB+', available: 22, reserved: 5, expiringSoon: 3, status: 'healthy', expiryDate: '2026-07-12', lastUpdated: '2026-06-26T10:00:00Z', donorType: 'Voluntary', collectionDate: '2026-06-21' },
  { id: 'inv-008', bloodType: 'AB-', available: 6, reserved: 1, expiringSoon: 1, status: 'critical', expiryDate: '2026-06-28', lastUpdated: '2026-06-26T11:30:00Z', donorType: 'Replacement', collectionDate: '2026-06-14' },
]

export const inventorySummary = {
  totalUnits: 198,
  totalReserved: 39,
  totalExpiringSoon: 26,
  byBloodType: inventoryItems.map(({ bloodType, available, reserved, expiringSoon, status }) => ({
    bloodType,
    available,
    reserved,
    expiringSoon,
    status,
  })),
}

export const todaysUpdates = [
  { id: 'upd-001', type: 'added', bloodType: 'B+', units: 12, message: '12 units of B+ added from donor drive', timestamp: '2026-06-26T08:15:00Z' },
  { id: 'upd-002', type: 'reserved', bloodType: 'O+', units: 4, message: '4 units of O+ reserved for surgery', timestamp: '2026-06-26T09:30:00Z' },
  { id: 'upd-003', type: 'expiring', bloodType: 'AB-', units: 1, message: '1 unit of AB- marked expiring tomorrow', timestamp: '2026-06-26T10:45:00Z' },
  { id: 'upd-004', type: 'transferred', bloodType: 'O-', units: 8, message: '8 units of O- incoming from Aditya Birla Memorial Hospital', timestamp: '2026-06-26T11:00:00Z' },
  { id: 'upd-005', type: 'updated', bloodType: 'A-', units: 8, message: 'A- stock count verified and updated', timestamp: '2026-06-26T07:20:00Z' },
]

export const availabilityCards = inventoryItems.map((item) => ({
  bloodType: item.bloodType,
  available: item.available,
  status: item.status,
  percentFull: Math.min(100, Math.round((item.available / 60) * 100)),
}))
