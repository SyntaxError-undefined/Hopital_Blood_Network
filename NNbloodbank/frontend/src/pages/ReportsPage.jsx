import { useState } from 'react'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import { PageHeader, PageLoader, ChartCard } from '@/components/ui/PageElements'
import { FilterBar } from '@/components/ui/FilterBar'
import { FilterDropdown } from '@/components/ui/FormElements'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import {
  UsageTrendChart,
  BloodTypePieChart,
  TransferBarChart,
  ExpiryTrendChart,
  HospitalComparisonChart,
  ForecastAccuracyChart,
} from '@/components/charts/Charts'
import { useAsyncData } from '@/hooks'
import { getReportsData, downloadReport } from '@/services/reports'
import { BLOOD_TYPES } from '@/utils'

export default function ReportsPage() {
  const { data, loading } = useAsyncData(getReportsData)
  const [bloodTypeFilter, setBloodTypeFilter] = useState('')
  const [timeRange, setTimeRange] = useState('6m')
  const [downloading, setDownloading] = useState(false)
  const [downloadMsg, setDownloadMsg] = useState('')

  const handleDownload = async () => {
    setDownloading(true)
    const result = await downloadReport()
    setDownloading(false)
    setDownloadMsg(`Report ready: ${result.filename}`)
    setTimeout(() => setDownloadMsg(''), 4000)
  }

  if (loading || !data) return <PageLoader />

  const { usageTrends, bloodTypeDistribution, transferStatistics, monthlyAnalytics, expiryTrend, hospitalComparison, forecastAccuracy } = data

  return (
    <div className="page-container">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive blood bank performance insights and trend analysis"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {downloadMsg && <span className="text-xs text-healthy">{downloadMsg}</span>}
            <Button variant="secondary" size="sm" onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4" />
              {downloading ? 'Preparing...' : 'Download Report'}
            </Button>
          </div>
        }
      />

      <FilterBar>
        <FilterDropdown value={bloodTypeFilter} onChange={setBloodTypeFilter} placeholder="All Blood Types" options={BLOOD_TYPES.map((t) => ({ value: t, label: t }))} className="w-40" />
        <FilterDropdown value={timeRange} onChange={setTimeRange} placeholder="Time Range" options={[{ value: '1m', label: 'Last Month' }, { value: '3m', label: 'Last 3 Months' }, { value: '6m', label: 'Last 6 Months' }, { value: '1y', label: 'Last Year' }]} className="w-44" />
      </FilterBar>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Units Used" value={monthlyAnalytics.totalUnitsUsed.value} change={monthlyAnalytics.totalUnitsUsed.change} trend={monthlyAnalytics.totalUnitsUsed.trend} icon={TrendingUp} />
        <StatCard title="Total Units Added" value={monthlyAnalytics.totalUnitsAdded.value} change={monthlyAnalytics.totalUnitsAdded.change} trend={monthlyAnalytics.totalUnitsAdded.trend} icon={TrendingUp} />
        <StatCard title="Units Transferred" value={monthlyAnalytics.unitsTransferred.value} change={monthlyAnalytics.unitsTransferred.change} trend={monthlyAnalytics.unitsTransferred.trend} icon={TrendingDown} />
        <StatCard title="Wastage (Expired)" value={monthlyAnalytics.wastageExpired.value} change={monthlyAnalytics.wastageExpired.change} trend={monthlyAnalytics.wastageExpired.trend} icon={TrendingDown} />
      </div>

      <ChartCard title="Blood Usage Trends" description="Monthly consumption across all blood types">
        <UsageTrendChart data={usageTrends} />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Expiry Trend" description="Expired units vs units expiring soon">
          <ExpiryTrendChart data={expiryTrend} />
        </ChartCard>
        <ChartCard title="Forecast Accuracy" description="AI model prediction accuracy over time">
          <ForecastAccuracyChart data={forecastAccuracy} />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Blood Type Distribution" description="Current inventory breakdown">
          <BloodTypePieChart data={bloodTypeDistribution} />
        </ChartCard>
        <ChartCard title="Transfer Statistics" description="Monthly transfer activity">
          <TransferBarChart data={transferStatistics} />
        </ChartCard>
      </div>

      <ChartCard title="Hospital Comparison" description="Usage, additions, and wastage across network hospitals">
        <HospitalComparisonChart data={hospitalComparison} />
      </ChartCard>

      <div className="interactive-card overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-subheading text-text">Top Transfers This Month</h3>
          <p className="mt-1 text-sm text-text-muted">Highest volume inter-hospital transfers</p>
        </div>
        <Table>
          <TableHeader>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Month</TableHead>
          </TableHeader>
          <TableBody>
            {data.topTransfers.map((transfer, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{transfer.from}</TableCell>
                <TableCell className="text-text-muted">{transfer.to}</TableCell>
                <TableCell><span className="font-bold text-primary">{transfer.bloodType}</span></TableCell>
                <TableCell className="font-medium">{transfer.units}</TableCell>
                <TableCell className="text-text-muted">{transfer.month}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
