import { cn } from '@/utils'

const badgeVariants = {
  healthy: 'bg-green-50 text-healthy border-green-200',
  warning: 'bg-orange-50 text-warning border-orange-200',
  high: 'bg-orange-50 text-warning border-orange-200',
  moderate: 'bg-amber-50 text-amber-600 border-amber-200',
  critical: 'bg-red-50 text-critical border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-gray-50 text-text-muted border-gray-200',
  primary: 'bg-red-50 text-primary border-red-200',
}

const sizeVariants = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export function Badge({ children, variant = 'default', size = 'md', className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        badgeVariants[variant] || badgeVariants.default,
        sizeVariants[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-healthy': variant === 'healthy',
            'bg-warning': variant === 'warning' || variant === 'high',
            'bg-amber-500': variant === 'moderate',
            'bg-critical': variant === 'critical',
            'bg-blue-500': variant === 'info',
            'bg-primary': variant === 'primary',
            'bg-gray-400': variant === 'default',
          })}
        />
      )}
      {children}
    </span>
  )
}

export function StatusBadge({ status, size = 'md' }) {
  const labels = {
    healthy: 'Healthy',
    warning: 'Warning',
    high: 'High',
    moderate: 'Moderate',
    critical: 'Critical',
    info: 'Info',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
  }
  return (
    <Badge variant={status} dot size={size}>
      {labels[status] || status}
    </Badge>
  )
}

export function UrgencyBadge({ urgency, size = 'md' }) {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  }
  const variantMap = {
    critical: 'critical',
    high: 'warning',
    medium: 'info',
    low: 'default',
  }
  return (
    <Badge variant={variantMap[urgency] || 'default'} dot size={size}>
      {labels[urgency] || urgency}
    </Badge>
  )
}
