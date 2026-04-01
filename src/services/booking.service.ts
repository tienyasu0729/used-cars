import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { ApiErrorResponse } from '@/types/auth.types'
import type {
  AvailableSlot,
  Booking,
  CreateBookingRequest,
  RescheduleRequest,
  ScheduleGroup,
} from '@/types/booking.types'
import type { PaginatedResponse } from '@/types/vehicle.types'

/** Chuẩn hóa HH:mm để so khớp slot từ API (có thể có giây). */
export function normalizeTimeSlot(t: string): string {
  if (!t) return t
  const parts = t.split(':')
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
  }
  return t
}

function mapBooking(raw: Record<string, unknown>): Booking {
  const b = raw as unknown as Booking
  return {
    ...b,
    timeSlot: normalizeTimeSlot(b.timeSlot),
  }
}

function mapMeta(meta: unknown): PaginatedResponse<Booking>['meta'] {
  const m = meta as Record<string, number>
  return {
    page: m.page ?? 0,
    size: m.size ?? 20,
    totalElements: m.totalElements ?? 0,
    totalPages: m.totalPages ?? 0,
  }
}

export const bookingService = {
  async getAvailableSlots(branchId: number, date: string, vehicleId?: number): Promise<AvailableSlot[]> {
    const res = (await axiosInstance.get('/bookings/available-slots', {
      params: { branchId, date, ...(vehicleId != null ? { vehicleId } : {}) },
    })) as unknown as ApiResponse<AvailableSlot[]>
    const rows = res.data ?? []
    return rows.map((s) => ({
      ...s,
      slotTime: normalizeTimeSlot(s.slotTime),
    }))
  },

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    try {
      const res = (await axiosInstance.post('/bookings', data)) as unknown as ApiResponse<Booking>
      return mapBooking(res.data as unknown as Record<string, unknown>)
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'SLOT_FULLY_BOOKED') {
        throw { ...err, message: 'Giờ này đã đầy, vui lòng chọn giờ khác' }
      }
      if (err.errorCode === 'VEHICLE_NOT_AVAILABLE') {
        throw { ...err, message: 'Xe này hiện không thể đặt lịch' }
      }
      throw e
    }
  },

  async getMyBookings(params: {
    status?: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<Booking>> {
    const res = (await axiosInstance.get('/bookings', {
      params: {
        status: params.status && params.status !== 'all' ? params.status : undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })) as unknown as ApiResponse<Booking[]>
    return {
      items: (res.data ?? []).map((b) => mapBooking(b as unknown as Record<string, unknown>)),
      meta: mapMeta(res.meta),
    }
  },

  async getBookingById(id: number): Promise<Booking> {
    const res = (await axiosInstance.get(`/bookings/${id}`)) as unknown as ApiResponse<Booking>
    return mapBooking(res.data as unknown as Record<string, unknown>)
  },

  async cancelBooking(id: number): Promise<Booking> {
    try {
      const res = (await axiosInstance.patch(`/bookings/${id}/cancel`)) as unknown as ApiResponse<Booking>
      return mapBooking(res.data as unknown as Record<string, unknown>)
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'BOOKING_CANNOT_CANCEL') {
        throw { ...err, message: 'Lịch hẹn này không thể hủy' }
      }
      throw e
    }
  },

  async getStaffBookings(params: {
    branchId: number
    status?: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<Booking>> {
    const res = (await axiosInstance.get('/staff/bookings', {
      params: {
        branchId: params.branchId,
        status: params.status && params.status !== 'all' ? params.status : undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })) as unknown as ApiResponse<Booking[]>
    return {
      items: (res.data ?? []).map((b) => mapBooking(b as unknown as Record<string, unknown>)),
      meta: mapMeta(res.meta),
    }
  },

  async getStaffSchedule(branchId: number, date: string): Promise<ScheduleGroup[]> {
    const res = (await axiosInstance.get('/staff/schedule', {
      params: { branchId, date },
    })) as unknown as ApiResponse<ScheduleGroup[]>
    return (res.data ?? []).map((g) => ({
      timeSlot: normalizeTimeSlot(g.timeSlot),
      bookings: g.bookings.map((b) => mapBooking(b as unknown as Record<string, unknown>)),
    }))
  },

  async confirmBooking(id: number, note?: string): Promise<Booking> {
    try {
      const res = (await axiosInstance.patch(`/bookings/${id}/confirm`, { note })) as unknown as ApiResponse<Booking>
      return mapBooking(res.data as unknown as Record<string, unknown>)
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'INVALID_STATUS_TRANSITION') {
        throw { ...err, message: 'Không thể xác nhận lịch ở trạng thái hiện tại.' }
      }
      throw e
    }
  },

  async rescheduleBooking(id: number, data: RescheduleRequest): Promise<Booking> {
    const res = (await axiosInstance.patch(`/bookings/${id}/reschedule`, data)) as unknown as ApiResponse<Booking>
    return mapBooking(res.data as unknown as Record<string, unknown>)
  },

  async completeBooking(id: number): Promise<Booking> {
    const res = (await axiosInstance.patch(`/bookings/${id}/complete`)) as unknown as ApiResponse<Booking>
    return mapBooking(res.data as unknown as Record<string, unknown>)
  },
}
