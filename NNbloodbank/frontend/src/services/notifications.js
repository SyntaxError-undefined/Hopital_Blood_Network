import { delay } from '@/utils'
import { notifications } from '@/mock/notifications'

let dismissedIds = new Set()

export async function getNotifications() {
  await delay()
  return notifications
    .filter((n) => !dismissedIds.has(n.id))
    .map((n) => ({ ...n }))
}

export async function getUnreadCount() {
  await delay()
  return notifications.filter((n) => !n.read && !dismissedIds.has(n.id)).length
}

export async function markAsRead(id) {
  await delay(300)
  const notification = notifications.find((n) => n.id === id)
  if (!notification) return null
  notification.read = true
  return { ...notification, read: true }
}

export async function markAllAsRead() {
  await delay(300)
  notifications.forEach((n) => { n.read = true })
  return notifications.map((n) => ({ ...n, read: true }))
}

export async function dismissNotification(id) {
  await delay(300)
  dismissedIds.add(id)
  return { success: true, id }
}

export async function getNotificationById(id) {
  await delay()
  const notification = notifications.find((n) => n.id === id)
  return notification ? { ...notification } : null
}
