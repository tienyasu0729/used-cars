export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'

export interface Booking {
  id: string
  vehicleId: string
  customerId: string
  branchId: string
  date: string
  timeSlot: string
  status: BookingStatus
  note?: string
}
