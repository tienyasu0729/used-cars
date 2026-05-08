import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { ApiErrorResponse } from '@/types/auth.types'
import type {
  AvailableSlot,
  Booking,
  CreateBookingRequest,
  CreateManagerBookingRequest,
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
  const vehicle = raw.vehicle && typeof raw.vehicle === 'object'
    ? (raw.vehicle as Record<string, unknown>)
    : null
  const vehicleImages = vehicle?.images
  const firstVehicleImage = Array.isArray(vehicleImages) && vehicleImages.length > 0 ? vehicleImages[0] : null
  const firstVehicleImageUrl = firstVehicleImage && typeof firstVehicleImage === 'object'
    ? (firstVehicleImage as Record<string, unknown>).url
    : null

  const vehicleImageCandidate =
    raw.vehicleImageUrl ??
    raw.vehicle_image_url ??
    raw.primaryImageUrl ??
    raw.primary_image_url ??
    raw.thumbnailUrl ??
    raw.thumbnail_url ??
    raw.imageUrl ??
    raw.image_url ??
    vehicle?.primaryImageUrl ??
    vehicle?.primary_image_url ??
    vehicle?.thumbnailUrl ??
    vehicle?.thumbnail_url ??
    firstVehicleImageUrl

  const vehicleTitleCandidate = raw.vehicleTitle ?? raw.vehicle_title ?? vehicle?.title

  return {
    ...b,
    vehicleImageUrl: vehicleImageCandidate != null ? String(vehicleImageCandidate) : b.vehicleImageUrl,
    vehicleTitle: vehicleTitleCandidate != null ? String(vehicleTitleCandidate) : b.vehicleTitle,
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
    return rows.map((s) => {
      const raw = s as AvailableSlot & { bookable?: boolean; unavailable_reason?: string | null }
      const normalizedReason = raw.unavailableReason ?? raw.unavailable_reason ?? null
      const normalizedBookable =
        (typeof raw.isBookable === 'boolean' ? raw.isBookable : undefined)
        ?? (typeof raw.bookable === 'boolean' ? raw.bookable : undefined)
        ?? (raw.availableCount > 0)
      return {
        ...raw,
        slotTime: normalizeTimeSlot(raw.slotTime),
        unavailableReason: normalizedReason as AvailableSlot['unavailableReason'],
        isBookable: Boolean(normalizedBookable) && raw.availableCount > 0,
      }
    })
  },

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    try {
      const res = (await axiosInstance.post('/bookings', data)) as unknown as ApiResponse<Booking>
      return mapBooking(res.data as unknown as Record<string, unknown>)
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'SLOT_FULLY_BOOKED') {
        throw { ...err, message: err.message || 'Giờ này đã đầy, vui lòng chọn giờ khác' }
      }
      if (err.errorCode === 'SLOT_NOT_FOUND') {
        throw { ...err, message: err.message || 'Chi nhánh không làm việc khung giờ đã chọn.' }
      }
      if (err.errorCode === 'VEHICLE_SLOT_TAKEN') {
        throw e
      }
      if (err.errorCode === 'VEHICLE_NOT_AVAILABLE') {
        throw { ...err, message: 'Xe này hiện không thể đặt lịch' }
      }
      throw e
    }
  },

  async createManagerBooking(data: CreateManagerBookingRequest): Promise<Booking> {
    const res = (await axiosInstance.post('/manager/bookings', data)) as unknown as ApiResponse<Booking>
    return mapBooking(res.data as unknown as Record<string, unknown>)
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

  async cancelBooking(id: number, note?: string): Promise<Booking> {
    try {
      const res = (await axiosInstance.patch(`/bookings/${id}/cancel`, note ? { note } : {})) as unknown as ApiResponse<Booking>
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

  /** Phân công nhân viên (BranchManager/Admin). {@code staffId === null} = gỡ phân công. */
  async assignBookingStaff(bookingId: number, branchId: number, staffId: number | null): Promise<Booking> {
    const res = (await axiosInstance.patch(`/staff/bookings/${bookingId}/assign`, { staffId }, {
      params: { branchId },
    })) as unknown as ApiResponse<Booking>
    return mapBooking(res.data as unknown as Record<string, unknown>)
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

  async markNoShow(id: number): Promise<Booking> {
    const res = (await axiosInstance.patch(`/bookings/${id}/no-show`)) as unknown as ApiResponse<Booking>
    return mapBooking(res.data as unknown as Record<string, unknown>)
  },
}
