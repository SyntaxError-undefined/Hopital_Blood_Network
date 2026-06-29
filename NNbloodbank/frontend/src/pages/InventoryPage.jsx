import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Package,
} from 'lucide-react'
import { PageHeader, PageLoader, EmptyState } from '@/components/ui/PageElements'
import { FilterBar } from '@/components/ui/FilterBar'
import { SearchBar, FilterDropdown } from '@/components/ui/FormElements'
import { StatusBadge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { useAsyncData } from '@/hooks'
import { getInventoryPageData } from '@/services/inventory'
import { BLOOD_TYPES, cn, formatDate, formatNumber } from '@/utils'

const statusStyles = {
  default: {
    text: 'text-text',
  },
  critical: {
    text: 'text-critical',
  },
  high: {
    text: 'text-warning',
  },
  moderate: {
    text: 'text-amber-500',
  },
  healthy: {
    text: 'text-healthy',
  },
}

const barColors = {
  critical: 'bg-critical',
  high: 'bg-warning',
  moderate: 'bg-amber-400',
  healthy: 'bg-healthy',
}

const statusFilterOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'healthy', label: 'Healthy' },
]

function ExpiryCard({ card }) {
  const style = statusStyles[card.status] || statusStyles.default

  return (
    <div className="interactive-card p-5">
      <div>
        <p className="text-sm font-medium text-text-muted">{card.label}</p>
        <p className={cn('mt-3 text-3xl font-bold tracking-tight', style.text)}>
          <AnimatedNumber value={card.value} />
          {card.key !== 'total' && <span className="ml-1 text-base font-medium text-text-muted">units</span>}
        </p>
        <p className="mt-2 text-sm text-text-muted">{card.sublabel}</p>
      </div>
    </div>
  )
}

function ExpiryOverview({ overview, totalExpiringSoon }) {
  const gradient = `conic-gradient(
    #D32F2F 0deg ${overview[0].percent * 3.6}deg,
    #FB8C00 ${overview[0].percent * 3.6}deg ${(overview[0].percent + overview[1].percent) * 3.6}deg,
    #FBBF24 ${(overview[0].percent + overview[1].percent) * 3.6}deg ${(overview[0].percent + overview[1].percent + overview[2].percent) * 3.6}deg,
    #2E7D32 ${(overview[0].percent + overview[1].percent + overview[2].percent) * 3.6}deg 360deg
  )`

  return (
    <div className="interactive-card p-6">
      <h3 className="text-subheading text-text">Expiry Overview (All Blood Types)</h3>
      <div className="mt-6 grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full" style={{ background: gradient }}>
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
            <span className="text-2xl font-bold text-text">{formatNumber(totalExpiringSoon)}</span>
            <span className="mt-1 text-[11px] leading-tight text-text-muted">units expiring within 7 days</span>
          </div>
        </div>
        <div className="space-y-3">
          {overview.map((item) => (
            <div key={item.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className={cn('h-3 w-3 rounded', barColors[item.status])} />
                <span className="font-medium text-text">{item.label}</span>
              </div>
              <span className="text-text-muted">{formatNumber(item.units)} units</span>
              <span className="w-12 text-right text-text-muted">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
      {totalExpiringSoon > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-critical/10 bg-critical/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-critical" />
            <div>
              <p className="text-sm font-semibold text-critical">
                {formatNumber(totalExpiringSoon)} units are expiring within 7 days.
              </p>
              <p className="text-xs text-text-muted">Immediate review is recommended for transfer or usage planning.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpiryTimeline({ timeline }) {
  const maxValue = Math.max(...timeline.map((item) => item.value), 1)

  return (
    <div className="interactive-card p-6">
      <h3 className="text-subheading text-text">Expiry Timeline (All Blood Types)</h3>
      <div className="mt-6 flex min-h-[220px] items-end gap-5 border-b border-gray-200 px-2 pb-4">
        {timeline.map((item) => (
          <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
            <span className="text-sm font-bold text-text">{formatNumber(item.value)}</span>
            <div
              className={cn('w-full max-w-14 rounded-t-lg', barColors[item.status])}
              style={{ height: `${Math.max(18, (item.value / maxValue) * 150)}px` }}
            />
            <span className="text-center text-xs font-medium text-text-muted">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs text-text-muted">
        <span>Critical</span>
        <span>High</span>
        <span>Moderate</span>
        <span>Healthy</span>
      </div>
    </div>
  )
}

function daysUntilLabel(date) {
  if (!date) return 'No active bags'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(date)
  expiry.setHours(0, 0, 0, 0)
  const days = Math.round((expiry.getTime() - today.getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}

export default function InventoryPage() {
  const { data, loading } = useAsyncData(getInventoryPageData, [], { refreshIntervalMs: 4000 })
  const [search, setSearch] = useState('')
  const [bloodTypeFilter, setBloodTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    if (!data?.items) return []
    return data.items.filter((item) => {
      const matchesSearch = item.bloodType.toLowerCase().includes(search.toLowerCase())
      const matchesType = !bloodTypeFilter || item.bloodType === bloodTypeFilter
      const matchesStatus = !statusFilter || item.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [data, search, bloodTypeFilter, statusFilter])

  const columns = useMemo(() => [
    {
      key: 'bloodType',
      label: 'Blood Type',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-text">
          {item.bloodType}
        </span>
      ),
    },
    { key: 'available', label: 'Available Units', sortable: true, render: (item) => <span className="font-semibold">{formatNumber(item.available)}</span> },
    { key: 'reserved', label: 'Reserved Units', sortable: true, render: (item) => <span className="text-text-muted">{formatNumber(item.reserved)}</span> },
    { key: 'days0To3', label: '0-3 days', sortable: true, render: (item) => <span className="font-semibold text-critical">{formatNumber(item.days0To3)}</span> },
    { key: 'days4To7', label: '4-7 days', sortable: true, render: (item) => <span className="font-semibold text-warning">{formatNumber(item.days4To7)}</span> },
    { key: 'days8To14', label: '8-14 days', sortable: true, render: (item) => <span className="font-semibold text-amber-500">{formatNumber(item.days8To14)}</span> },
    { key: 'daysOver14', label: '>14 days', sortable: true, render: (item) => <span className="font-semibold text-healthy">{formatNumber(item.daysOver14)}</span> },
    {
      key: 'oldestExpiryDate',
      label: 'Oldest Expiry',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-text-muted">
          {item.oldestExpiryDate ? formatDate(item.oldestExpiryDate) : 'None'}
          <span className={cn('ml-1 font-semibold', item.status === 'critical' ? 'text-critical' : 'text-text-light')}>
            ({daysUntilLabel(item.oldestExpiryDate)})
          </span>
        </span>
      ),
    },
    { key: 'status', label: 'Status', sortable: true, render: (item) => <StatusBadge status={item.status} size="sm" /> },
  ], [])

  if (loading || !data) return <PageLoader />

  const { summary, expiryCards, overview, timeline } = data

  return (
    <div className="page-container">
      <PageHeader
        title="Inventory Management"
        description="Real-time blood inventory with expiry tracking and urgency alerts"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {expiryCards.filter((card) => card.key === 'total').map((card) => (
          <ExpiryCard key={card.key} card={card} />
        ))}
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-subheading text-text">Expiry Status</h2>
          <p className="mt-1 text-sm text-text-muted">Units grouped by remaining shelf life across all blood types.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {expiryCards.filter((card) => card.key !== 'total').map((card) => (
            <ExpiryCard key={card.key} card={card} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ExpiryOverview overview={overview} totalExpiringSoon={summary.totalExpiringSoon} />
        </div>
        <div className="xl:col-span-3">
          <ExpiryTimeline timeline={timeline} />
        </div>
      </div>

      <div className="interactive-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-subheading text-text">Blood Inventory</h3>
            <p className="mt-1 text-sm text-text-muted">Latest stock snapshots and active blood bag expiry buckets from the backend.</p>
          </div>
          <FilterBar className="border-0 bg-transparent p-0 shadow-none">
            <FilterDropdown value={bloodTypeFilter} onChange={setBloodTypeFilter} placeholder="All Blood Types" options={BLOOD_TYPES.map((t) => ({ value: t, label: t }))} className="w-full sm:w-40" />
            <FilterDropdown value={statusFilter} onChange={setStatusFilter} placeholder="All Status" options={statusFilterOptions} className="w-full sm:w-40" />
            <SearchBar value={search} onChange={setSearch} placeholder="Search blood type..." className="w-full sm:w-56" />
          </FilterBar>
        </div>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} pageSize={8} rowKey="id" />
        ) : (
          <EmptyState icon={Package} title="No inventory found" description="Try adjusting your search or filters." />
        )}
      </div>
    </div>
  )
}
