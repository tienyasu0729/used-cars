/**
 * Cài đặt chi nhánh — GET/PUT /manager/settings
 * Admin bắt buộc query branchId; BranchManager có thể bỏ.
 */
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

/** 0 = CN … 6 = T7 — khớp backend. */
export interface BranchDayScheduleDto {
  dayOfWeek: number
  closed: boolean
  openTime: string | null
  closeTime: string | null
}

export interface BranchSettingsDto {
  name: string
  address: string
  phone: string | null
  manager: string | null
  openTime: string | null
  closeTime: string | null
  workingDays: number[]
  dailySchedules?: BranchDayScheduleDto[]
  showroomImageUrls?: string[]
  lat?: number | null
  lng?: number | null
}

export interface UpdateBranchSettingsPayload {
  name: string
  address: string
  phone?: string | null
  dailySchedules: Array<{
    dayOfWeek: number
    closed: boolean
    openTime: string
    closeTime: string
  }>
  showroomImageUrls?: string[]
  lat?: number | null
  lng?: number | null
}

function unwrapData<T>(res: unknown): T {
  const r = res as ApiResponse<T> | T
  if (r && typeof r === 'object' && 'data' in r && (r as ApiResponse<T>).data !== undefined) {
    return (r as ApiResponse<T>).data as T
  }
  return r as T
}

/** Chuẩn hóa LocalTime từ API (chuỗi hoặc object Jackson). */
export function normalizeTimeForInput(v: string | null | undefined): string {
  if (v == null || v === '') return '08:00'
  if (typeof v === 'string') {
    const m = v.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/)
    if (m) {
      const h = m[1].padStart(2, '0')
      const min = m[2]
      return `${h}:${min}`
    }
  }
  return '08:00'
}

/** Gửi backend: HH:mm:ss */
export function toLocalTimePayload(hhmm: string): string {
  const t = hhmm.trim()
  if (/^\d{1,2}:\d{2}$/.test(t)) return `${t.split(':').map((x, i) => (i === 0 ? x.padStart(2, '0') : x)).join(':')}:00`
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(t)) {
    const [h, m, s] = t.split(':')
    return `${h.padStart(2, '0')}:${m}:${s}`
  }
  return '08:00:00'
}

export async function getBranchSettings(branchId?: number): Promise<BranchSettingsDto> {
  const res = await axiosInstance.get<unknown>('/manager/settings', {
    params: branchId != null ? { branchId } : undefined,
  })
  const d = unwrapData<Record<string, unknown>>(res)
  const workingDays = Array.isArray(d.workingDays)
    ? (d.workingDays as unknown[]).map((x) => Number(x)).filter((n) => n >= 0 && n <= 6)
    : []
  const rawDaily = d.dailySchedules
  let dailySchedules: BranchDayScheduleDto[] | undefined
  if (Array.isArray(rawDaily)) {
    dailySchedules = rawDaily.map((raw) => {
      const o = raw as Record<string, unknown>
      return {
        dayOfWeek: Number(o.dayOfWeek),
        closed: Boolean(o.closed),
        openTime: o.openTime != null ? String(o.openTime) : null,
        closeTime: o.closeTime != null ? String(o.closeTime) : null,
      }
    }).filter((x) => x.dayOfWeek >= 0 && x.dayOfWeek <= 6)
  }
  const rawShowroom = d.showroomImageUrls
  const showroomImageUrls = Array.isArray(rawShowroom)
    ? (rawShowroom as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : undefined
  const lat = d.lat != null && Number.isFinite(Number(d.lat)) ? Number(d.lat) : null
  const lng = d.lng != null && Number.isFinite(Number(d.lng)) ? Number(d.lng) : null
  return {
    name: String(d.name ?? ''),
    address: String(d.address ?? ''),
    phone: d.phone != null ? String(d.phone) : null,
    manager: d.manager != null ? String(d.manager) : null,
    openTime: d.openTime != null ? String(d.openTime) : null,
    closeTime: d.closeTime != null ? String(d.closeTime) : null,
    workingDays,
    dailySchedules,
    showroomImageUrls,
    lat,
    lng,
  }
}

export async function updateBranchSettings(
  payload: UpdateBranchSettingsPayload,
  branchId?: number
): Promise<void> {
  await axiosInstance.put<unknown>('/manager/settings', payload, {
    params: branchId != null ? { branchId } : undefined,
  })
}

// --- Goong Geocoding: chuyển địa chỉ thành tọa độ GPS ---

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY || ''

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  if (!GOONG_API_KEY) throw new Error('Chưa cấu hình VITE_GOONG_API_KEY.')
  const trimmed = address.trim()
  if (!trimmed) throw new Error('Địa chỉ không được để trống.')
  const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(trimmed)}&api_key=${GOONG_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Goong API lỗi: ${res.status}`)
  const json = await res.json()
  const results = json?.results
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Không tìm thấy tọa độ cho địa chỉ này.')
  }
  const loc = results[0]?.geometry?.location
  if (!loc || !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) {
    throw new Error('Kết quả geocoding không hợp lệ.')
  }
  return { lat: loc.lat, lng: loc.lng }
}

// --- Booking slots (template theo chi nhánh) ---

export interface BookingSlotSettingDto {
  id?: number
  slotTime: string
  maxBookings: number
  isActive: boolean
}

export interface UpdateBookingSlotsPayload {
  slots: Array<{ slotTime: string; maxBookings: number; isActive: boolean }>
}

/** LocalTime JSON: chuỗi "HH:mm:ss" hoặc mảng [h, m, s?]. */
function slotTimeFromApi(v: unknown): string {
  if (typeof v === 'string') return normalizeTimeForInput(v)
  if (Array.isArray(v) && v.length >= 2) {
    const h = Number(v[0])
    const m = Number(v[1])
    if (Number.isFinite(h) && Number.isFinite(m)) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }
  return '09:00'
}

function parseBookingSlotRow(raw: unknown): BookingSlotSettingDto {
  const o = raw as Record<string, unknown>
  return {
    id: o.id != null ? Number(o.id) : undefined,
    slotTime: slotTimeFromApi(o.slotTime),
    maxBookings: o.maxBookings != null ? Math.max(0, Number(o.maxBookings)) : 1,
    isActive: Boolean(o.isActive),
  }
}

/**
 * @param branchId Bắt buộc với Admin
 * @param activeOnly true = GET chỉ slot is_active (theo query backend)
 */
export async function getBookingSlots(branchId?: number, activeOnly?: boolean): Promise<BookingSlotSettingDto[]> {
  const res = await axiosInstance.get<unknown>('/manager/settings/booking-slots', {
    params: {
      ...(branchId != null ? { branchId } : {}),
      ...(activeOnly === true ? { activeOnly: true } : {}),
    },
  })
  const unwrapped = unwrapData<unknown>(res)
  if (!Array.isArray(unwrapped)) return []
  return unwrapped.map(parseBookingSlotRow)
}

export async function updateBookingSlots(
  payload: UpdateBookingSlotsPayload,
  branchId?: number
): Promise<void> {
  const body = {
    slots: payload.slots.map((s) => ({
      slotTime: toLocalTimePayload(s.slotTime),
      maxBookings: s.maxBookings,
      isActive: s.isActive,
    })),
  }
  await axiosInstance.put<unknown>('/manager/settings/booking-slots', body, {
    params: branchId != null ? { branchId } : undefined,
  })
}
