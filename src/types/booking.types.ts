/**
 * Tier 3.2 — Booking & lái thử (khớp DB: không có NoShow)
 */

export type BookingStatus =
  | 'AwaitingContract'
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'
  | 'NoShow'

export type SlotUnavailableReason =
  | 'BRANCH_CLOSED'
  | 'OUTSIDE_WORKING_HOURS'
  | 'FULL'
  | 'VEHICLE_CONFLICT'

export interface AvailableSlot {
  slotTime: string
  availableCount: number
  maxBookings: number
  isBookable: boolean
  unavailableReason?: SlotUnavailableReason | null
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
  customerName?: string | null
  customerPhone?: string | null
  vehicleId: number
  vehicleTitle: string
  vehicleListingId: string
  branchId: number
  branchName: string
  bookingDate: string
  timeSlot: string
  staffId: number | null
  /** Tên nhân viên phụ trách (nếu đã phân công). */
  staffName?: string | null
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

export interface CreateManagerBookingRequest {
  vehicleId: number
  branchId: number
  bookingDate: string
  timeSlot: string
  type: string
  note?: string
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
  }
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
