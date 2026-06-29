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
import { timeAgo } from '@/utils'

const activityIcons = {
  transfer: Truck,
  alert: AlertTriangle,
  inventory: Plus,
  forecast: TrendingDown,
  default: Check,
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, loading } = useAsyncData(getDashboardData, [], { refreshIntervalMs: 4000 })

  if (loading || !data) return <PageLoader />

  const { stats, activity, forecast, inventory } = data
  const hasCritical = stats.criticalAlerts.value > 0

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
          title="Expiring Soon"
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card hover className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory by Blood Type</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTable data={inventory.byBloodType} />
          </CardContent>
        </Card>

        <Card className="border-critical/15">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shortage Alert</CardTitle>
              <span className="rounded-full bg-critical/10 px-2.5 py-0.5 text-xs font-bold text-critical">
                {forecast.bloodType}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="metric-label">Current Stock</p>
            <p className="mt-1 text-3xl font-bold text-text">
              <AnimatedNumber value={forecast.currentStock} />
              <span className="ml-1 text-base font-medium text-text-muted">units</span>
            </p>
            <div className="mt-4">
              <MiniAreaChart data={forecast.chartData} color="#D32F2F" height={90} />
            </div>
            <div className="mt-4 rounded-xl border border-critical/15 bg-critical/[0.04] p-4">
              <p className="text-sm font-semibold text-critical">
                Critical in {forecast.criticalInHours} hours
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Stock projected to fall below safe threshold
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate('/forecast')}
            >
              View Full Forecast
            </Button>
          </CardContent>
        </Card>
      </div>

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
