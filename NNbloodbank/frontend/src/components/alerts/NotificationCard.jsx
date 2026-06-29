import { motion } from 'framer-motion'
import { cn, timeAgo } from '@/utils'
import { Badge } from '@/components/ui/Badge'

const typeStyles = {
  critical: { accent: 'border-l-critical', icon: 'bg-red-50 text-critical border-red-100' },
  warning: { accent: 'border-l-warning', icon: 'bg-orange-50 text-warning border-orange-100' },
  info: { accent: 'border-l-blue-400', icon: 'bg-blue-50 text-blue-600 border-blue-100' },
}

export function NotificationCard({ notification, icon: Icon, onClick, onDismiss, index = 0 }) {
  const style = typeStyles[notification.type] || typeStyles.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'group relative flex cursor-pointer items-start gap-4 rounded-2xl border border-l-[3px] bg-white p-5 shadow-card transition-all hover:shadow-card-hover',
        style.accent,
        !notification.read ? 'border-gray-200' : 'border-gray-100 opacity-85'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', style.icon)}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className={cn('text-sm leading-snug', !notification.read ? 'font-semibold text-text' : 'font-medium text-text-muted')}>
              {notification.title}
            </h3>
            {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </div>
          <Badge variant={notification.type} size="sm">{notification.type}</Badge>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{notification.message}</p>
        <p className="mt-2 text-xs text-text-light">{timeAgo(notification.timestamp)}</p>
      </div>
      {onDismiss && (
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notification.id) }}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-text-light opacity-0 transition-all hover:bg-gray-100 hover:text-text group-hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </motion.div>
  )
}
