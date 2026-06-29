import { cn } from '@/utils'
import { PageSkeleton } from './Skeleton'

export function PageHeader({ title, description, actions, className, badge }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-heading text-text">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
      )}
    </div>
  )
}

export function ChartCard({ title, description, children, className, action, legend }) {
  return (
    <div className={cn('interactive-card p-6', className)}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-subheading text-text">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-text-muted">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {legend}
          {action}
        </div>
      </div>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sublabel, variant = 'default', className, children }) {
  const variants = {
    default: 'border-gray-100',
    critical: 'border-critical/20 bg-critical/[0.02]',
    warning: 'border-warning/20 bg-warning/[0.02]',
    healthy: 'border-healthy/20 bg-healthy/[0.02]',
  }

  return (
    <div className={cn('interactive-card p-6', variants[variant], className)}>
      <p className="metric-label">{label}</p>
      <div className="mt-3">{value}</div>
      {sublabel && <p className="mt-1.5 text-sm text-text-muted">{sublabel}</p>}
      {children}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card">
          <Icon className="h-7 w-7 text-text-light" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingSpinner({ className, size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-10 w-10' }
  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-label="Loading">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-primary',
          sizes[size]
        )}
      />
    </div>
  )
}

export function PageLoader() {
  return <PageSkeleton />
}
