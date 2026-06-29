import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Clock, Check, X, Eye, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UrgencyBadge, StatusBadge } from '@/components/ui/Badge'
import { InfoChip } from '@/components/ui/InfoChip'
import { cn } from '@/utils'

export function TransferCard({ transfer, onViewDetails, onAccept, onReject, index = 0 }) {
  const isCritical = transfer.urgency === 'critical'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        'interactive-card overflow-hidden',
        isCritical && 'border-critical/25 ring-1 ring-critical/10'
      )}
    >
      {isCritical && (
        <div className="bg-critical/5 px-6 py-2 text-xs font-semibold text-critical">
          Immediate action required
        </div>
      )}

      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={transfer.urgency} size="md" />
              <StatusBadge status={transfer.status} />
              <span className="rounded-lg bg-primary/8 px-2.5 py-1 text-sm font-bold text-primary">
                {transfer.bloodType}
              </span>
              <span className="text-sm text-text-muted">{transfer.units} units</span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light">From</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-text">{transfer.fromHospital.name}</p>
                <p className="truncate text-xs text-text-muted">{transfer.fromHospital.location}</p>
              </div>

              <div className="flex shrink-0 items-center justify-center sm:px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light">To</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-text">{transfer.toHospital.name}</p>
                <p className="truncate text-xs text-text-muted">{transfer.toHospital.location}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">{transfer.reason}</p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end lg:min-w-[200px]">
            <div className="flex flex-wrap gap-2">
              <InfoChip icon={MapPin} variant="distance">{transfer.distance} km</InfoChip>
              <InfoChip icon={Clock} variant={transfer.expiryDays <= 3 ? 'expiry' : 'default'}>
                {transfer.expiryDays}d expiry
              </InfoChip>
              <InfoChip icon={Sparkles} variant="success">AI {transfer.aiScore}%</InfoChip>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button variant="secondary" size="sm" onClick={() => onViewDetails(transfer)}>
                <Eye className="h-4 w-4" />
                Details
              </Button>
              {transfer.status === 'pending' && (
                <>
                  <Button variant="success" size="sm" onClick={() => onAccept(transfer)}>
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onReject(transfer)}>
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
