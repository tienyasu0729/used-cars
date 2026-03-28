import { Link } from 'react-router-dom'
import type { Booking } from '@/types/booking.types'
import type { Vehicle } from '@/types/vehicle.types'
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
  Rescheduled: { variant: 'pending', label: 'Đổi Lịch' },
  Completed: { variant: 'confirmed', label: 'Hoàn Thành' },
  Cancelled: { variant: 'default', label: 'Đã Hủy' },
}

export function BookingCard({ booking, vehicle, branch }: BookingCardProps) {
  const status = statusMap[booking.status] ?? { variant: 'default', label: booking.status }
  const img0 = vehicle?.images?.[0]
  const imageUrl =
    (typeof img0 === 'string' ? img0 : img0?.url) ?? 'https://placehold.co/80x60'
  const title =
    vehicle != null
      ? `${vehicle.brand} ${vehicle.model}`
      : booking.vehicleTitle || 'Xe'
  const branchName = branch?.name ?? booking.branchName

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">
          {formatDate(booking.bookingDate)} {booking.timeSlot} - {branchName}
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
