import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Calendar, Car, ArrowRightLeft, CheckCheck, Check } from 'lucide-react'
import { useManagerNotifications } from '@/hooks/useManagerNotifications'
import { Button } from '@/components/ui'
import type { Notification } from '@/types'
import { formatDate } from '@/utils/format'

const typeIcons: Record<string, typeof Bell> = {
  AppointmentTestDrive: Car,
  AppointmentConsultation: Calendar,
  TransferIncoming: ArrowRightLeft,
  TransferOutgoing: ArrowRightLeft,
}

const filters = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'unread', label: 'Chưa Đọc' },
  { key: 'AppointmentTestDrive', label: 'Lịch Lái Thử' },
  { key: 'AppointmentConsultation', label: 'Lịch Tư Vấn' },
  { key: 'TransferIncoming', label: 'Điều Chuyển Đến' },
  { key: 'TransferOutgoing', label: 'Điều Chuyển Đi' },
]

function NotificationCard({ n }: { n: Notification }) {
  const Icon = typeIcons[n.type] ?? Bell
  return (
    <Link
      to={n.link ?? '#'}
      className={`flex gap-4 rounded-xl border p-5 transition-all hover:shadow-md ${
        n.read ? 'border-slate-200 bg-white' : 'border-[#1A3C6E]/30 bg-gradient-to-r from-blue-50/80 to-white'
      }`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${n.read ? 'bg-slate-100 text-slate-500' : 'bg-[#1A3C6E]/15 text-[#1A3C6E]'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-base ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
          {n.title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.body}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <span>{formatDate(n.createdAt)}</span>
          {!n.read && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8612A]/20 px-2 py-0.5 text-[#E8612A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8612A]" />
              Mới
            </span>
          )}
        </p>
      </div>
      {!n.read && (
        <div className="flex h-3 w-3 shrink-0 self-center rounded-full bg-[#E8612A]" />
      )}
    </Link>
  )
}

export function ManagerNotificationsPage() {
  const [filter, setFilter] = useState('all')
  const { data: notifications } = useManagerNotifications()

  const filtered =
    filter === 'all'
      ? notifications ?? []
      : filter === 'unread'
        ? (notifications ?? []).filter((n) => !n.read)
        : (notifications ?? []).filter((n) => n.type === filter)

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Thông Báo</h1>
            <p className="mt-1 text-slate-500">Trung tâm thông báo quản lý chi nhánh</p>
            {unreadCount > 0 && (
              <p className="mt-2 flex items-center gap-2 text-sm text-[#1A3C6E]">
                <Check className="h-4 w-4" />
                {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Đánh Dấu Tất Cả Đã Đọc
            </Button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-medium text-slate-500">Không có thông báo</p>
            <p className="mt-1 text-sm text-slate-400">Các thông báo mới sẽ hiển thị tại đây</p>
          </div>
        ) : (
          filtered.map((n) => <NotificationCard key={n.id} n={n} />)
        )}
      </div>
    </div>
  )
}
