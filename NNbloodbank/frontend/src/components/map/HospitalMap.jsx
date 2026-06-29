import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Phone, Droplets } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { cn } from '@/utils'

const statusColors = {
  healthy: '#2E7D32',
  warning: '#FB8C00',
  critical: '#D32F2F',
}

function createMarkerIcon(status, isSelected = false) {
  const color = statusColors[status] || statusColors.healthy
  const size = isSelected ? 40 : 34
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,${isSelected ? '0.35' : '0.2'});
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      ${isSelected ? 'transform: scale(1.1);' : ''}
    "><div style="width: ${isSelected ? 10 : 8}px; height: ${isSelected ? 10 : 8}px; border-radius: 50%; background: white;"></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function MapBounds({ hospitals }) {
  const map = useMap()
  useEffect(() => {
    if (hospitals.length > 0) {
      const bounds = L.latLngBounds(hospitals.map((h) => h.coordinates))
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [hospitals, map])
  return null
}

function HospitalPopup({ hospital }) {
  return (
    <div className="min-w-[220px] p-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text">{hospital.name}</h3>
          <p className="mt-0.5 text-xs text-text-muted">{hospital.location}</p>
        </div>
        <StatusBadge status={hospital.status} size="sm" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <Droplets className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-text">{hospital.totalUnits}</span>
        <span className="text-xs text-text-muted">units available</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
        <Phone className="h-3 w-3" />
        {hospital.contact}
      </div>
    </div>
  )
}

export function HospitalMap({ hospitals, selectedId, onSelect, height = '500px' }) {
  const center = [19.076, 72.8777]

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapBounds hospitals={hospitals} />
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={hospital.coordinates}
            icon={createMarkerIcon(hospital.status, hospital.id === selectedId)}
            eventHandlers={{
              click: () => onSelect?.(hospital.id),
            }}
          >
            <Popup>
              <HospitalPopup hospital={hospital} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export function MapLegend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-100 bg-white px-5 py-3.5 shadow-card">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Status</span>
      {items.map((item) => (
        <div key={item.status} className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
          <span className="text-sm text-text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function NetworkSummary({ hospitals }) {
  const healthy = hospitals.filter((h) => h.status === 'healthy').length
  const warning = hospitals.filter((h) => h.status === 'warning').length
  const critical = hospitals.filter((h) => h.status === 'critical').length
  const totalUnits = hospitals.reduce((sum, h) => sum + h.totalUnits, 0)

  const stats = [
    { label: 'Hospitals', value: hospitals.length, color: 'text-text' },
    { label: 'Total Units', value: totalUnits.toLocaleString('en-IN'), color: 'text-text' },
    { label: 'Healthy', value: healthy, color: 'text-healthy' },
    { label: 'Warning', value: warning, color: 'text-warning' },
    { label: 'Critical', value: critical, color: 'text-critical' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light">{stat.label}</p>
          <p className={cn('mt-1 text-xl font-bold', stat.color)}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
