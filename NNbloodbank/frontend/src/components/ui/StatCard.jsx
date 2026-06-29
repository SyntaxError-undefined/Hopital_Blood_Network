import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatNumber } from '@/utils'
import { AnimatedNumber } from './AnimatedNumber'
import { Card, CardContent } from './Card'

export function StatCard({ title, value, change, trend, icon: Icon, className, suffix, animate = true }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up' ? 'text-healthy' : trend === 'down' ? 'text-critical' : 'text-text-muted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card hover className={className}>
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <p className="metric-label">{title}</p>
              <div className="flex items-baseline gap-1.5">
                {animate && typeof value === 'number' ? (
                  <AnimatedNumber value={value} className="metric-value" />
                ) : (
                  <span className="metric-value">
                    {typeof value === 'number' ? formatNumber(value) : value}
                  </span>
                )}
                {suffix && <span className="text-sm font-medium text-text-muted">{suffix}</span>}
              </div>
              {change !== undefined && (
                <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  <span>{Math.abs(change)}%</span>
                  <span className="font-normal text-text-light">vs last week</span>
                </div>
              )}
            </div>
            {Icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08]">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
