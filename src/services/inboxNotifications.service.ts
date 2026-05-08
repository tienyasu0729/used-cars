import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { InboxNotificationRow, InboxUnreadCount } from '@/types/inboxNotification.types'
import type { Notification, NotificationType } from '@/types/notification'

export const inboxNotificationsListKey = ['inbox-notifications', 'list'] as const
export const inboxNotificationsUnreadKey = ['inbox-notifications', 'unread-count'] as const

const NOTIFICATION_TYPES: NotificationType[] = [
  'Booking',
  'Deposit',
  'Order',
  'Installment',
  'PriceDrop',
  'System',
  'Consultation',
  'AppointmentTestDrive',
  'AppointmentConsultation',
  'TransferIncoming',
  'TransferOutgoing',
]

function mapType(t: string): NotificationType {
  const key = t.trim()
  const match = NOTIFICATION_TYPES.find((x) => x.toLowerCase() === key.toLowerCase())
  return match ?? 'System'
}

export function mapInboxRowToNotification(r: InboxNotificationRow): Notification {
  return {
    id: String(r.id),
    type: mapType(r.type),
    title: r.title,
    body: r.body,
    read: r.read,
    createdAt: r.createdAt,
    link: r.link ?? undefined,
  }
}

export async function fetchInboxNotifications(
  page = 0,
  size = 200,
  isRead?: boolean
): Promise<{ items: Notification[]; meta: unknown }> {
  const res = (await axiosInstance.get('/notifications', {
    params: { page, size, ...(isRead !== undefined ? { is_read: isRead } : {}) },
  })) as ApiResponse<InboxNotificationRow[]>
  const raw = res.data
  const list = Array.isArray(raw) ? raw : []
  return { items: list.map(mapInboxRowToNotification), meta: res.meta }
}

export async function fetchInboxUnreadCount(): Promise<number> {
  const res = (await axiosInstance.get('/notifications/unread-count')) as ApiResponse<InboxUnreadCount>
  return typeof res.data?.count === 'number' ? res.data.count : 0
}

export async function markInboxNotificationRead(id: number): Promise<void> {
  await axiosInstance.patch(`/notifications/${id}/read`)
}

export async function markAllInboxNotificationsRead(): Promise<void> {
  await axiosInstance.patch('/notifications/read-all')
}
