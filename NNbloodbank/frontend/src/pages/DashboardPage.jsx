import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Droplets,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  Truck,
  Plus,
  TrendingDown,
  Check,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  Siren,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InventoryTable } from '@/components/ui/Table'
import { MiniAreaChart } from '@/components/charts/Charts'
import { PageHeader, PageLoader } from '@/components/ui/PageElements'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { useAsyncData } from '@/hooks'
import { getDashboardData } from '@/services/dashboard'
import { timeAgo, cn } from '@/utils'

const activityIcons = {
  transfer: Truck,
  alert: AlertTriangle,
  inventory: Plus,
  forecast: TrendingDown,
  default: Check,
}

// Status config for colours & icons
const STATUS_CONFIG = {
  healthy: {
    label: 'All Good',
    icon: CheckCircle2,
    dot: 'bg-healthy',
    bg: 'bg-healthy/[0.06]',
    border: 'border-healthy/20',
    text: 'text-healthy',
    badge: 'bg-healthy/10 text-healthy',
    ring: 'ring-healthy/30',
  },
  warning: {
    label: 'Warning',
    icon: ShieldAlert,
    dot: 'bg-warning animate-pulse',
    bg: 'bg-warning/[0.06]',
    border: 'border-warning/25',
    text: 'text-warning',
    badge: 'bg-warning/10 text-warning',
    ring: 'ring-warning/30',
  },
  critical: {
    label: 'Critical',
    icon: Siren,
    dot: 'bg-critical animate-pulse',
    bg: 'bg-critical/[0.06]',
    border: 'border-critical/25',
    text: 'text-critical',
    badge: 'bg-critical/10 text-critical',
    ring: 'ring-critical/30',
  },
}

const BT_STATUS_PILL = {
  critical: 'bg-critical/10 text-critical border border-critical/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  healthy: 'bg-healthy/10 text-healthy border border-healthy/20',
  unknown: 'bg-gray-100 text-gray-400',
}

function BloodTypeRow({ bloodType, count, threshold, status, chartData }) {
  const isAlert = status === 'critical' || status === 'warning'
  const color = status === 'critical' ? '#D32F2F' : status === 'warning' ? '#FB8C00' : '#2E7D32'

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
      isAlert ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-50/60'
    )}>
      {/* Blood type badge */}
      <span className={cn('shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide', BT_STATUS_PILL[status])}>
        {bloodType}
      </span>

      {/* Stock bar */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, ((count ?? 0) / Math.max(threshold * 3, 1)) * 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Threshold marker */}
          <div
            className="absolute top-0 h-full w-px bg-gray-400/50"
            style={{ left: `${Math.min(100, (threshold / Math.max(threshold * 3, 1)) * 100)}%` }}
          />
        </div>
        <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums" style={{ color }}>
          {count ?? '—'} u
        </span>
      </div>

      {/* Mini sparkline for alert types */}
      {isAlert && chartData.length > 0 && (
        <div className="w-16 shrink-0">
          <MiniAreaChart data={chartData} dataKey="value" color={color} height={30} />
        </div>
      )}
    </div>
  )
}

function ShortageAlertBody({ shortageAlert }) {
  if (!shortageAlert) return null
  const { overallStatus, alertBloodTypes, bloodTypes, totalUnits } = shortageAlert
  const cfg = STATUS_CONFIG[overallStatus] || STATUS_CONFIG.healthy
  const isHealthy = overallStatus === 'healthy'

  return (
    <div className={cn('rounded-2xl border p-4', cfg.bg, cfg.border)}>
      {/* Status badge row — no hospital name */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{totalUnits} units total</p>
        <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1', cfg.badge, cfg.ring)}>
          <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
          {cfg.label}
        </div>
      </div>

      {/* ── Healthy: green signal ── */}
      {isHealthy && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-healthy/10 border border-healthy/20 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-healthy" strokeWidth={2} />
          <div>
            <p className="text-xs font-semibold text-healthy">All blood types within safe limits</p>
            <p className="text-[10px] text-healthy/70 mt-0.5">No action required · Stock stable</p>
          </div>
          <motion.div
            className="ml-auto h-3 w-3 rounded-full bg-healthy"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* ── Warning / Critical: scrollable blood type rows ── */}
      {!isHealthy && alertBloodTypes.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            {overallStatus === 'critical' ? 'Critical & Warning blood types' : 'Low stock blood types'}
          </p>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {alertBloodTypes.map((bt) => (
              <BloodTypeRow key={bt.bloodType} {...bt} />
            ))}
          </div>
        </div>
      )}

      {/* Healthy BT chips */}
      {!isHealthy && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bloodTypes
            .filter((bt) => bt.status === 'healthy')
            .map((bt) => (
              <span key={bt.bloodType} className="rounded-full bg-healthy/10 px-2 py-0.5 text-[10px] font-bold text-healthy border border-healthy/15">
                {bt.bloodType} ✓
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, loading } = useAsyncData(getDashboardData, [], { refreshIntervalMs: 4000 })

  if (loading || !data) return <PageLoader />

  const { stats, activity, forecast, inventory, shortageAlerts } = data
  const hasCritical = stats.criticalAlerts.value > 0
  const myHospitalStatus = shortageAlerts?.overallStatus || 'healthy'

  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        description="Overview of your blood bank operations and network status"
      />

      {hasCritical && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-2xl border border-critical/20 bg-critical/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-critical/10">
              <AlertTriangle className="h-5 w-5 text-critical" />
            </div>
            <div>
              <p className="text-sm font-semibold text-critical">
                {stats.criticalAlerts.value} critical alert{stats.criticalAlerts.value !== 1 ? 's' : ''} require attention
              </p>
              <p className="text-xs text-text-muted">
                {forecast.bloodType} stock projected critical in {forecast.criticalInHours} hours
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/forecast')}>
            View Forecast
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* ── Stat cards (real backend data) ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Blood Units"
          value={stats.totalBloodUnits.value}
          change={stats.totalBloodUnits.change}
          trend={stats.totalBloodUnits.trend}
          icon={Droplets}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlerts.value}
          change={stats.criticalAlerts.change}
          trend={stats.criticalAlerts.trend}
          icon={AlertTriangle}
        />
        <StatCard
          title="Expiring Soon (≤7d)"
          value={stats.expiringSoon.value}
          change={stats.expiringSoon.change}
          trend={stats.expiringSoon.trend}
          icon={Clock}
        />
        <StatCard
          title="Incoming Transfers"
          value={stats.incomingTransfers.value}
          change={stats.incomingTransfers.change}
          trend={stats.incomingTransfers.trend}
          icon={ArrowLeftRight}
        />
      </div>

      {/* ── Inventory table + Shortage Alert card ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card hover className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory by Blood Type</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTable data={inventory.byBloodType} />
          </CardContent>
        </Card>

        {/* ── Shortage Alert card — signed-in hospital only ── */}
        <Card className={cn(
          myHospitalStatus === 'critical' ? 'border-critical/15' :
          myHospitalStatus === 'warning' ? 'border-warning/15' : 'border-healthy/15'
        )}>
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle>
                {myHospitalStatus === 'critical' ? 'Shortage Alert' :
                 myHospitalStatus === 'warning' ? 'Low Stock Alert' : 'Stock Outlook'}
              </CardTitle>
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-bold',
                myHospitalStatus === 'critical' ? 'bg-critical/10 text-critical' :
                myHospitalStatus === 'warning' ? 'bg-warning/10 text-warning' : 'bg-healthy/10 text-healthy'
              )}>
                {myHospitalStatus}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">Your hospital's live blood stock status</p>
          </CardHeader>

          <CardContent className="flex flex-col min-h-0 pt-0 space-y-4">
            {/* Per-blood-type alert body */}
            <ShortageAlertBody shortageAlert={shortageAlerts} />

            {/* Mini trend chart for the most critical blood type */}
            {forecast.criticalInHours && (
              <div className="shrink-0">
                <p className="metric-label mb-2">{forecast.bloodType} · 48h trend</p>
                <MiniAreaChart data={forecast.chartData} color="#D32F2F" height={70} />
                <div className="mt-3 rounded-xl border border-critical/15 bg-critical/[0.04] p-3">
                  <p className="text-sm font-semibold text-critical">Critical in {forecast.criticalInHours}h</p>
                  <p className="mt-0.5 text-xs text-text-muted">Stock projected to fall below safe threshold</p>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full shrink-0"
              onClick={() => navigate('/forecast')}
            >
              View Full Forecast
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card hover>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-50">
            {activity.map((item, i) => {
              const Icon = activityIcons[item.type] || activityIcons.default
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                    <Icon className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-text">{item.message}</p>
                    <p className="mt-1 text-xs text-text-light">{timeAgo(item.timestamp)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
