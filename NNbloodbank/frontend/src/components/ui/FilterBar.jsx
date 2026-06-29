import { cn } from '@/utils'

export function FilterBar({ children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-card sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
    >
      {children}
    </div>
  )
}

export function FilterLabel({ children }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-text-light sm:mr-1">
      {children}
    </span>
  )
}
