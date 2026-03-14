import { Link } from 'react-router-dom'
import type { Booking } from '@/types'
import type { Vehicle } from '@/types'
import type { Branch } from '@/types'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui'

interface BookingCardProps {
  booking: Booking
  vehicle?: Vehicle | null
  branch?: Branch | null
}

const statusMap: Record<string, { variant: 'pending' | 'confirmed' | 'sold' | 'default'; label: string }> = {
  Pending: { variant: 'pending', label: 'Chờ Xác Nhận' },
  Confirmed: { variant: 'confirmed', label: 'Đã Xác Nhận' },
  Completed: { variant: 'confirmed', label: 'Hoàn Thành' },
  Cancelled: { variant: 'default', label: 'Đã Hủy' },
}

export function BookingCard({ booking, vehicle, branch }: BookingCardProps) {
  const status = statusMap[booking.status] ?? { variant: 'default', label: booking.status }
  const imageUrl = vehicle?.images?.[0] ?? 'https://placehold.co/80x60'

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">
          {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Xe'}
        </p>
        <p className="text-xs text-slate-500">
          {formatDate(booking.date)} {booking.timeSlot} - {branch?.name ?? 'Chi nhánh'}
        </p>
      </div>
      <Badge variant={status.variant}>{status.label}</Badge>
      <Link
        to={`/dashboard/bookings`}
        className="shrink-0 text-sm font-medium text-[#1A3C6E] hover:underline"
      >
        Xem chi tiết
      </Link>
    </div>
  )
}
