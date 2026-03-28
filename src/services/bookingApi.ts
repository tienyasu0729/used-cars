import { bookingService } from './booking.service'
import { isMockMode } from '@/config/dataSource'

/** @deprecated Dùng booking.service.ts cho code mới — giữ cho modal cũ */
export interface CreateBookingPayload {
  vehicleId: string
  branchId: string
  date: string
  timeSlot: string
  note?: string
}

export interface CreateBookingResponse {
  success: boolean
  id: string
}

export const bookingApi = {
  getBookings: () => bookingService.getMyBookings({ page: 0, size: 50 }),
  confirmBooking: async (id: string) => {
    if (isMockMode()) return { success: true }
    await bookingService.confirmBooking(Number(id))
    return { success: true }
  },
  cancelBooking: async (id: string) => {
    if (isMockMode()) return { success: true }
    await bookingService.cancelBooking(Number(id))
    return { success: true }
  },
  createBooking: async (data: CreateBookingPayload): Promise<{ data: CreateBookingResponse }> => {
    if (isMockMode()) {
      return { data: { success: true, id: `booking_${Date.now()}` } }
    }
    const created = await bookingService.createBooking({
      vehicleId: Number(data.vehicleId),
      branchId: Number(data.branchId),
      bookingDate: data.date,
      timeSlot: data.timeSlot,
      note: data.note,
    })
    return { data: { success: true, id: String(created.id) } }
  },
}
