import type { Booking } from '@/types/booking.types'
import { BookingStatusBadge } from './BookingStatusBadge'

export function MyBookingsList({ bookings }: { bookings: Booking[] }) {
  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li
          key={b.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="font-semibold text-slate-900">{b.vehicleTitle}</p>
            <p className="text-sm text-slate-500">
              {b.bookingDate} · {b.timeSlot} · {b.branchName}
            </p>
          </div>
          <BookingStatusBadge status={b.status} />
        </li>
      ))}
    </ul>
  )
}
