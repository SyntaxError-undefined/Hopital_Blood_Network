import { cn } from '@/utils'

const variants = {
  default: 'bg-gray-50 text-text-muted border-gray-200',
  distance: 'bg-blue-50 text-blue-700 border-blue-100',
  expiry: 'bg-orange-50 text-warning border-orange-100',
  critical: 'bg-red-50 text-critical border-red-100',
  success: 'bg-green-50 text-healthy border-green-100',
}

export function InfoChip({ icon: Icon, children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  )
}
