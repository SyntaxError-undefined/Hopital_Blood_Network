import { cn } from '@/utils'

export function Skeleton({ className }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-gray-100', className)}
      aria-hidden="true"
    />
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading content">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-80" />
      <Skeleton className="h-64" />
    </div>
  )
}
