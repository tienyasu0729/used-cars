/**
 * Tier 3.2 — Booking & lái thử (khớp DB: không có NoShow)
 */

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled'

export interface AvailableSlot {
  slotTime: string
  availableCount: number
  maxBookings: number
}

export interface BookingStatusHistoryItem {
  oldStatus: string | null
  newStatus: string
  changedBy: number | null
  note: string | null
  changedAt: string
}

/** Payload API — đồng bộ backend BookingResponse */
export interface Booking {
  id: number
  customerId?: number
  vehicleId: number
  vehicleTitle: string
  vehicleListingId: string
  branchId: number
  branchName: string
  bookingDate: string
  timeSlot: string
  staffId: number | null
  status: BookingStatus
  note: string | null
  createdAt: string
  statusHistory?: BookingStatusHistoryItem[]
}

export interface CreateBookingRequest {
  vehicleId: number
  branchId: number
  bookingDate: string
  timeSlot: string
  note?: string
}

export interface RescheduleRequest {
  newBookingDate: string
  newTimeSlot: string
  note?: string
}

export interface ScheduleGroup {
  timeSlot: string
  bookings: Booking[]
}
