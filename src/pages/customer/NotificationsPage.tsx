import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationList } from '@/features/customer/components/NotificationList'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui'
import {
  inboxNotificationsListKey,
  inboxNotificationsUnreadKey,
  markAllInboxNotificationsRead,
  markInboxNotificationRead,
} from '@/services/inboxNotifications.service'

const filters = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'unread', label: 'Chưa Đọc' },
  { key: 'Booking', label: 'Lịch Hẹn' },
  { key: 'Deposit', label: 'Đặt Cọc' },
  { key: 'Consultation', label: 'Tư Vấn' },
  { key: 'PriceDrop', label: 'Giảm Giá' },
]

export function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  const qc = useQueryClient()
  const { data: notifications } = useNotifications()

  const markOne = useMutation({
    mutationFn: (id: string) => markInboxNotificationRead(Number(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...inboxNotificationsListKey] })
      void qc.invalidateQueries({ queryKey: [...inboxNotificationsUnreadKey] })
    },
  })

  const markAll = useMutation({
    mutationFn: () => markAllInboxNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...inboxNotificationsListKey] })
      void qc.invalidateQueries({ queryKey: [...inboxNotificationsUnreadKey] })
    },
  })

  const filtered =
    filter === 'all'
      ? notifications ?? []
      : filter === 'unread'
        ? (notifications ?? []).filter((n) => !n.read)
        : (notifications ?? []).filter((n) => n.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông Báo</h1>
          <p className="mt-1 text-slate-500">Trung tâm thông báo cá nhân</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          Đánh Dấu Tất Cả Đã Đọc
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-[#1A3C6E] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <NotificationList
        notifications={filtered}
        onMarkRead={(id) => markOne.mutate(id)}
        linkBehavior="customer"
      />
    </div>
  )
}
