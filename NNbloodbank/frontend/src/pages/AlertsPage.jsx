import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Clock, TrendingDown, Truck, FileText,
  ArrowLeftRight, Building2, Settings, Heart, Bell, CheckCheck,
} from 'lucide-react'
import { PageHeader, PageLoader, EmptyState } from '@/components/ui/PageElements'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { NotificationCard } from '@/components/alerts/NotificationCard'
import { useAsyncData } from '@/hooks'
import { getNotifications, markAllAsRead, dismissNotification, getNotificationById, markAsRead } from '@/services/notifications'
import { timeAgo, cn } from '@/utils'

const iconMap = {
  'alert-triangle': AlertTriangle,
  clock: Clock,
  'trending-down': TrendingDown,
  truck: Truck,
  'file-text': FileText,
  'arrow-left-right': ArrowLeftRight,
  'building-2': Building2,
  settings: Settings,
  heart: Heart,
}

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warning' },
  { id: 'info', label: 'Information' },
]

export default function AlertsPage() {
  const { data: notifications, loading, refetch } = useAsyncData(getNotifications)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!notifications) return []
    if (activeTab === 'all') return notifications
    if (activeTab === 'unread') return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === activeTab)
  }, [notifications, activeTab])

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    refetch()
  }

  const handleDismiss = async (id) => {
    await dismissNotification(id)
    if (selectedId === id) setDrawerOpen(false)
    refetch()
  }

  const handleOpenDetail = async (notification) => {
    if (!notification.read) await markAsRead(notification.id)
    const detail = await getNotificationById(notification.id)
    setDrawerData(detail)
    setSelectedId(notification.id)
    setDrawerOpen(true)
    refetch()
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-container">
      <PageHeader
        title="Alerts & Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        badge={unreadCount > 0 ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{unreadCount} new</span>
        ) : null}
        actions={unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/80 p-1">
        {tabs.map((tab) => {
          const count = tab.id === 'all' ? notifications?.length
            : tab.id === 'unread' ? unreadCount
            : notifications?.filter((n) => n.type === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              {tab.label}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-200/80 text-text-muted')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative space-y-3 pl-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-gray-200">
        <AnimatePresence mode="popLayout">
          {filtered.map((notification, i) => {
            const Icon = iconMap[notification.icon] || Bell
            return (
              <div key={notification.id} className="relative">
                <div className={cn(
                  'absolute -left-4 top-6 z-10 h-2.5 w-2.5 rounded-full border-2 border-white',
                  notification.type === 'critical' ? 'bg-critical' :
                  notification.type === 'warning' ? 'bg-warning' : 'bg-blue-400'
                )} />
                <NotificationCard
                  notification={notification}
                  icon={Icon}
                  index={i}
                  onClick={() => handleOpenDetail(notification)}
                  onDismiss={handleDismiss}
                />
              </div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up in this category." />
        )}
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerData?.title || 'Notification'}
        description={drawerData ? timeAgo(drawerData.timestamp) : ''}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDrawerOpen(false)}>Close</Button>
            {drawerData && (
              <Button variant="danger" className="flex-1" onClick={() => handleDismiss(drawerData.id)}>Dismiss</Button>
            )}
          </div>
        }
      >
        {drawerData && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-text-muted">{drawerData.message}</p>
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p><span className="text-text-muted">Type: </span><span className="font-medium capitalize">{drawerData.type}</span></p>
              <p className="mt-2"><span className="text-text-muted">Status: </span><span className="font-medium">{drawerData.read ? 'Read' : 'Unread'}</span></p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
