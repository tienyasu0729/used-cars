import { Link } from 'react-router-dom'
import type { Notification } from '@/types'
import { formatDate } from '@/utils/format'
import { Bell, Calendar, Shield, ShoppingBag, Tag, Car, ArrowRightLeft } from 'lucide-react'

const typeIcons: Record<string, typeof Bell> = {
  Booking: Calendar,
  Deposit: Shield,
  Order: ShoppingBag,
  PriceDrop: Tag,
  System: Bell,
  AppointmentTestDrive: Car,
  AppointmentConsultation: Calendar,
  TransferIncoming: ArrowRightLeft,
  TransferOutgoing: ArrowRightLeft,
}

interface NotificationListProps {
  notifications: Notification[]
  onMarkRead?: (id: string) => void
}

export function NotificationList({ notifications, onMarkRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Không có thông báo
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => {
        const Icon = typeIcons[n.type] ?? Bell
        return (
          <Link
            key={n.id}
            to={n.link ?? '#'}
            onClick={(e) => {
              if (!n.read) onMarkRead?.(n.id)
              if (!n.link) e.preventDefault()
            }}
            className={`flex gap-4 rounded-xl border p-4 transition-colors hover:bg-slate-50 ${
              n.read ? 'border-slate-200 bg-white' : 'border-[#1A3C6E]/20 bg-blue-50/50'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3C6E]/10 text-[#1A3C6E]">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-medium ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                {n.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{n.body}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
            </div>
            {!n.read && (
              <div className="h-2 w-2 shrink-0 rounded-full bg-[#E8612A]" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
