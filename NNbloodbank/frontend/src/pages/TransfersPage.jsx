import { useState, useMemo } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { PageHeader, PageLoader, EmptyState } from '@/components/ui/PageElements'
import { FilterBar, FilterLabel } from '@/components/ui/FilterBar'
import { SearchBar, FilterDropdown } from '@/components/ui/FormElements'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { UrgencyBadge, StatusBadge } from '@/components/ui/Badge'
import { TransferCard } from '@/components/transfers/TransferCard'
import { useAsyncData } from '@/hooks'
import { getTransferSuggestions, getTransferById, acceptTransfer, rejectTransfer } from '@/services/transfers'
import { cn } from '@/utils'

export default function TransfersPage() {
  const { data: transfers, loading, refetch } = useAsyncData(
    getTransferSuggestions,
    [],
    { refreshIntervalMs: 4000 }
  )
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('urgency')
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const filtered = useMemo(() => {
    if (!transfers) return []
    let result = transfers.filter((t) => {
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        t.bloodType.toLowerCase().includes(q) ||
        t.fromHospital.name.toLowerCase().includes(q) ||
        t.toHospital.name.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q)
      const matchesUrgency = !urgencyFilter || t.urgency === urgencyFilter
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesSearch && matchesUrgency && matchesStatus
    })
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    result.sort((a, b) => {
      if (sortBy === 'urgency') return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      if (sortBy === 'distance') return a.distance - b.distance
      if (sortBy === 'expiry') return a.expiryHours - b.expiryHours
      return 0
    })
    return result
  }, [transfers, search, urgencyFilter, statusFilter, sortBy])

  const criticalCount = transfers?.filter((t) => t.urgency === 'critical' && t.status === 'pending').length || 0

  const handleViewDetails = async (transfer) => {
    setLoadingDetails(true)
    setShowDetails(true)
    const details = await getTransferById(transfer.id)
    setSelectedTransfer(details)
    setLoadingDetails(false)
  }

  const handleAccept = async (transfer) => {
    await acceptTransfer(transfer.id)
    setShowDetails(false)
    refetch()
  }

  const handleReject = async (transfer) => {
    await rejectTransfer(transfer.id)
    setShowDetails(false)
    refetch()
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-container">
      <PageHeader
        title="Transfer Suggestions"
        description="AI-optimized blood transfer recommendations across the hospital network"
        badge={criticalCount > 0 ? (
          <span className="rounded-full bg-critical/10 px-3 py-1 text-xs font-bold text-critical">{criticalCount} critical</span>
        ) : null}
      />

      <FilterBar>
        <SearchBar value={search} onChange={setSearch} placeholder="Search hospitals, blood type..." className="flex-1" />
        <FilterLabel>Filters</FilterLabel>
        <FilterDropdown value={urgencyFilter} onChange={setUrgencyFilter} placeholder="All Urgency" options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} className="w-full sm:w-36" />
        <FilterDropdown value={statusFilter} onChange={setStatusFilter} placeholder="All Status" options={[{ value: 'pending', label: 'Pending' }, { value: 'accepted', label: 'Accepted' }, { value: 'rejected', label: 'Rejected' }]} className="w-full sm:w-36" />
        <FilterDropdown value={sortBy} onChange={setSortBy} placeholder="Sort by" options={[{ value: 'urgency', label: 'Urgency' }, { value: 'distance', label: 'Distance' }, { value: 'expiry', label: 'Expiry' }]} className="w-full sm:w-36" />
      </FilterBar>

      <div className="space-y-4">
        {filtered.map((transfer, i) => (
          <TransferCard
            key={transfer.id}
            transfer={transfer}
            index={i}
            onViewDetails={handleViewDetails}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
        {filtered.length === 0 && (
          <EmptyState icon={ArrowLeftRight} title="No transfer suggestions" description="Try adjusting your search or filters." />
        )}
      </div>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Transfer Details"
        size="xl"
        footer={
          selectedTransfer?.status === 'pending' ? (
            <>
              <Button variant="danger" onClick={() => handleReject(selectedTransfer)}>Reject</Button>
              <Button onClick={() => handleAccept(selectedTransfer)}>Accept Transfer</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
          )
        }
      >
        {loadingDetails ? (
          <p className="py-8 text-center text-sm text-text-muted">Loading details...</p>
        ) : selectedTransfer && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={selectedTransfer.urgency} />
              <StatusBadge status={selectedTransfer.status} />
              <span className="rounded-lg bg-primary/8 px-3 py-1 text-sm font-bold text-primary">{selectedTransfer.bloodType}</span>
              <span className="text-sm text-text-muted">{selectedTransfer.units} units</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light">From Hospital</p>
                <p className="mt-1 font-semibold text-text">{selectedTransfer.fromHospital.name}</p>
                <p className="text-sm text-text-muted">{selectedTransfer.fromHospital.location}</p>
                <p className="mt-2 text-xs text-text-muted">Stock: {selectedTransfer.fromStock?.total || '—'} units</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light">To Hospital</p>
                <p className="mt-1 font-semibold text-text">{selectedTransfer.toHospital.name}</p>
                <p className="text-sm text-text-muted">{selectedTransfer.toHospital.location}</p>
                <p className="mt-2 text-xs text-text-muted">Stock: {selectedTransfer.toStock?.total || '—'} units</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4">
              <p className="text-sm font-medium text-text">Reason</p>
              <p className="mt-1.5 text-sm text-text-muted">{selectedTransfer.reason}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-text">Forecast Impact</p>
              <p className="mt-1 text-sm text-text-muted">{selectedTransfer.forecast}</p>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-text">Transfer Timeline</p>
              <div className="space-y-0">
                {selectedTransfer.timeline?.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                        step.status === 'completed' && 'border-healthy bg-healthy/10 text-healthy',
                        step.status === 'active' && 'border-primary bg-primary/10 text-primary',
                        step.status === 'pending' && 'border-gray-200 bg-gray-50 text-text-light'
                      )}>
                        {i + 1}
                      </div>
                      {i < selectedTransfer.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium text-text">{step.step}</p>
                      <p className="text-xs text-text-muted">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-healthy/20 bg-healthy/[0.03] p-4">
              <p className="text-sm font-medium text-healthy">Expected Impact</p>
              <p className="mt-1 text-sm text-text-muted">{selectedTransfer.expectedImpact}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
