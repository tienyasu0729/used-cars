import { useNavigate } from 'react-router-dom'
import type { Booking } from '@/types/booking.types'
import type { Vehicle } from '@/types/vehicle.types'
import type { Branch } from '@/types'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui'
import { ChevronRight } from 'lucide-react'

interface BookingCardProps {
  booking: Booking
  vehicle?: Vehicle | null
  branch?: Branch | null
  onViewDetail?: (booking: Booking) => void
}

const statusMap: Record<string, { variant: 'pending' | 'confirmed' | 'sold' | 'default'; label: string }> = {
  AwaitingContract: { variant: 'pending', label: 'Chờ Ký Hợp Đồng' },
  Pending: { variant: 'pending', label: 'Chờ Xác Nhận' },
  Confirmed: { variant: 'confirmed', label: 'Đã Xác Nhận' },
  Rescheduled: { variant: 'pending', label: 'Đổi Lịch' },
  Completed: { variant: 'confirmed', label: 'Hoàn Thành' },
  Cancelled: { variant: 'default', label: 'Đã Hủy' },
}

export function BookingCard({
  booking,
  vehicle,
  branch,
  onViewDetail,
}: BookingCardProps) {
  const navigate = useNavigate()
  const status = statusMap[booking.status] ?? { variant: 'default', label: booking.status }
  const img0 = vehicle?.images?.[0]
  const imageUrl =
    (typeof img0 === 'string' ? img0 : img0?.url) ?? 'https://placehold.co/80x60'
  const title =
    vehicle != null
      ? `${vehicle.brand} ${vehicle.model}`
      : booking.vehicleTitle || 'Xe'
  const branchName = branch?.name ?? booking.branchName

  const handleClick = () => {
    if (booking.status === 'AwaitingContract') {
      navigate(`/dashboard/bookings/${booking.id}/contract`)
    } else {
      onViewDetail?.(booking)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-[#1A3C6E]/30 hover:shadow-md"
    >
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
      {booking.status === 'AwaitingContract' ? (
        <span className="shrink-0 rounded-lg bg-[#E8612A] px-3 py-1 text-xs font-medium text-white">Ký ngay</span>
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#1A3C6E]" />
      )}
    </button>
  )
}
