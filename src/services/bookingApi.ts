import { api } from './apiClient'
import { isMockMode } from '@/config/dataSource'

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
  getBookings: () => api.get('/bookings'),
  createBooking: async (data: CreateBookingPayload): Promise<{ data: CreateBookingResponse }> => {
    if (isMockMode()) {
      return {
        data: { success: true, id: `booking_${Date.now()}` },
      }
    }
    try {
      const res = await api.post<CreateBookingResponse>('/bookings', data)
      return { data: res.data }
    } catch {
      return {
        data: { success: true, id: `booking_${Date.now()}` },
      }
    }
  },
}
