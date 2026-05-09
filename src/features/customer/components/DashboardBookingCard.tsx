import { Link } from 'react-router-dom'
import type { Booking } from '@/types/booking.types'
import type { Vehicle } from '@/types/vehicle.types'
import type { Branch } from '@/types'
import { ChevronRight } from 'lucide-react'

const MONTHS = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

function formatTimeSlot(s: string): string {
  const [h, m] = s.split(':').map(Number)
  if (h >= 12) return `${h === 12 ? 12 : h - 12}:${String(m || 0).padStart(2, '0')} PM`
  return `${h || 12}:${String(m || 0).padStart(2, '0')} AM`
}

interface DashboardBookingCardProps {
  booking: Booking
  vehicle?: Vehicle | null
  branch?: Branch | null
}

export function DashboardBookingCard({ booking, vehicle, branch }: DashboardBookingCardProps) {
  const d = new Date(booking.bookingDate)
  const month = MONTHS[d.getMonth() + 1]
  const day = d.getDate()

  return (
    <Link
      to="/dashboard/bookings"
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
    >
      <div className="min-w-[60px] rounded-lg bg-slate-100 p-3 text-center">
        <p className="text-xs font-bold uppercase text-slate-500">{month}</p>
        <p className="text-xl font-black leading-tight text-[#1A3C6E]">{day}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">
          {vehicle ? `Lái thử ${vehicle.brand} ${vehicle.model}` : booking.vehicleTitle || 'Lịch hẹn'}
        </p>
        <p className="text-xs text-slate-500">
          {formatTimeSlot(booking.timeSlot)} - {branch?.name ?? 'Chi nhánh'}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </Link>
  )
}
