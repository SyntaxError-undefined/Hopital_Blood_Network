import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, AlertTriangle } from 'lucide-react'
import { PageHeader, PageLoader, ChartCard, MetricCard } from '@/components/ui/PageElements'
import { FilterDropdown } from '@/components/ui/FormElements'
import { StatusBadge } from '@/components/ui/Badge'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import {
  ForecastChart,
  ConfidenceGauge,
  HistoricalBarChart,
  ChartLegend,
} from '@/components/charts/Charts'
import { useAsyncData } from '@/hooks'
import { getForecastData } from '@/services/forecast'
import { BLOOD_TYPES, cn } from '@/utils'

const CRITICAL_THRESHOLD = 10

function WarningTimeline({ criticalInHours, predictedDate }) {
  const steps = [
    { label: 'Current', status: 'active', desc: 'Monitoring stock levels' },
    { label: 'Warning', status: criticalInHours ? 'upcoming' : 'safe', desc: criticalInHours ? 'Declining trend detected' : 'No warning' },
    { label: 'Critical', status: criticalInHours ? 'danger' : 'safe', desc: criticalInHours ? `Expected in ${criticalInHours}h` : 'Not projected' },
  ]

  return (
    <div className="interactive-card p-6">
      <h3 className="text-sm font-semibold text-text">Risk Timeline</h3>
      <div className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex flex-1 flex-col items-center text-center">
            {i < steps.length - 1 && (
              <div className="absolute left-[calc(50%+20px)] top-4 hidden h-px w-[calc(100%-40px)] bg-gray-200 sm:block" />
            )}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                step.status === 'active' && 'border-primary bg-primary text-white',
                step.status === 'upcoming' && 'border-warning bg-warning/10 text-warning',
                step.status === 'danger' && 'border-critical bg-critical/10 text-critical',
                step.status === 'safe' && 'border-healthy bg-healthy/10 text-healthy'
              )}
            >
              {i + 1}
            </div>
            <p className="mt-3 text-sm font-semibold text-text">{step.label}</p>
            <p className="mt-1 max-w-[120px] text-xs text-text-muted">{step.desc}</p>
          </div>
        ))}
      </div>
      {predictedDate && (
        <p className="mt-4 text-center text-xs text-text-muted">
          Projected critical date: <span className="font-medium text-critical">{predictedDate}</span>
        </p>
      )}
    </div>
  )
}

export default function ForecastPage() {
  const [bloodType, setBloodType] = useState('O-')
  const [dateRange, setDateRange] = useState('14d')
  const { data: forecast, loading } = useAsyncData(
    () => getForecastData(bloodType, dateRange),
    [bloodType, dateRange],
    { refreshIntervalMs: 4000 }
  )

  if (loading || !forecast) return <PageLoader />

  const riskVariant = forecast.riskLevel === 'critical' ? 'critical' : forecast.riskLevel === 'warning' ? 'warning' : 'healthy'

  return (
    <div className="page-container">
      <PageHeader
        title="Shortage Prediction"
        description="AI-powered forecasting to anticipate blood stock shortages before they impact patient care"
        badge={
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {forecast.bloodType}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <FilterDropdown
              value={bloodType}
              onChange={setBloodType}
              placeholder="Blood Type"
              options={BLOOD_TYPES.map((t) => ({ value: t, label: t }))}
              className="w-36"
            />
            <FilterDropdown
              value={dateRange}
              onChange={setDateRange}
              placeholder="Date Range"
              options={[
                { value: '7d', label: 'Next 7 Days' },
                { value: '14d', label: 'Next 14 Days' },
                { value: '30d', label: 'Next 30 Days' },
              ]}
              className="w-40"
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current Stock"
          variant={riskVariant}
          value={
            <p className="metric-value">
              <AnimatedNumber value={forecast.currentStock} />
              <span className="ml-1.5 text-lg font-medium text-text-muted">units</span>
            </p>
          }
          sublabel={`${forecast.bloodType} available now`}
        />

        <MetricCard
          label="Critical Countdown"
          variant={forecast.criticalInHours ? 'critical' : 'healthy'}
          value={
            forecast.criticalInHours ? (
              <p className="metric-value text-critical">
                <AnimatedNumber value={forecast.criticalInHours} />
                <span className="text-lg font-medium">h</span>
              </p>
            ) : (
              <p className="metric-value text-healthy">Safe</p>
            )
          }
          sublabel={forecast.criticalInHours ? 'Until critical threshold' : 'No shortage predicted'}
        />

        <MetricCard
          label="Model Confidence"
          value={
            <div className="flex justify-center py-1">
              <ConfidenceGauge value={forecast.confidence} size={140} />
            </div>
          }
        />

        <MetricCard
          label="Risk Assessment"
          variant={riskVariant}
          value={<div className="mt-1"><StatusBadge status={forecast.riskLevel} size="lg" /></div>}
        />
      </div>

      <ChartCard
        title="Stock Trend & Forecast"
        description="Solid line shows actual inventory. Dashed line is the AI prediction with confidence bounds."
        legend={
          <ChartLegend
            items={[
              { label: 'Current Stock', color: '#C62828' },
              { label: 'AI Forecast', color: '#FB8C00' },
              { label: 'Critical Threshold', color: '#D32F2F' },
            ]}
          />
        }
      >
        <ForecastChart data={forecast.chartData} criticalThreshold={forecast.criticalThreshold || CRITICAL_THRESHOLD} />
      </ChartCard>

      <div className="interactive-card p-6">
        <h3 className="text-sm font-semibold text-text">Trend Explanation</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{forecast.trendExplanation}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <div className="interactive-card overflow-hidden border-primary/15">
            <div className="border-b border-primary/10 bg-primary/[0.03] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-subheading text-text">AI Insight</h3>
                  <p className="text-xs text-text-muted">Generated from consumption patterns & scheduled demand</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm leading-relaxed text-text-muted">{forecast.aiInsight}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm">
                  <span className="text-text-muted">Confidence </span>
                  <span className="font-bold text-primary">{forecast.confidence}%</span>
                </div>
                {forecast.criticalInHours && (
                  <div className="flex items-center gap-2 rounded-xl border border-critical/20 bg-critical/5 px-4 py-2.5 text-sm font-medium text-critical">
                    <AlertTriangle className="h-4 w-4" />
                    Action required within {forecast.criticalInHours} hours
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <WarningTimeline
            criticalInHours={forecast.criticalInHours}
            predictedDate={forecast.predictedDate}
          />
          <ChartCard title="Historical Trend" description="Monthly usage vs received">
            <HistoricalBarChart data={forecast.historicalTrend} height={200} />
          </ChartCard>
          <div className="interactive-card p-5">
            <h3 className="text-sm font-semibold text-text">Recent Predictions</h3>
            <div className="mt-4 space-y-3">
              {(forecast.allRecentPredictions || []).slice(0, 4).map((pred) => (
                <div key={pred.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <span className="text-sm font-bold text-primary">{pred.bloodType}</span>
                    <p className="text-xs text-text-muted">{pred.prediction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text">{pred.confidence}%</p>
                    <p className={cn('text-xs capitalize', pred.outcome === 'confirmed' ? 'text-healthy' : pred.outcome === 'pending' ? 'text-warning' : 'text-text-muted')}>
                      {pred.outcome}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
