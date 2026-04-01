/**
 * Hồ sơ user đăng nhập — GET/PUT /users/me, POST /users/me/avatar
 */
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { ProfileGender, UserProfile } from '@/types/auth.types'

export interface UpdateMyProfileBody {
  name: string
  /** Đã chuẩn hoá 0xxxxxxxxx hoặc null */
  phone?: string | null
  address?: string | null
  /** ISO yyyy-mm-dd hoặc null */
  dateOfBirth?: string | null
  gender?: ProfileGender | null
}

function unwrapProfile(res: unknown): UserProfile {
  const r = res as ApiResponse<UserProfile> | UserProfile
  if (r && typeof r === 'object' && 'data' in r && r.data && typeof r.data === 'object' && 'id' in r.data) {
    return r.data as UserProfile
  }
  if (r && typeof r === 'object' && 'id' in r) {
    return r as UserProfile
  }
  throw new Error('PROFILE_PARSE')
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const res = await axiosInstance.get<unknown>('/users/me')
  return unwrapProfile(res)
}

export async function updateMyProfile(body: UpdateMyProfileBody): Promise<UserProfile> {
  const res = await axiosInstance.put<unknown>('/users/me', {
    name: body.name,
    phone: body.phone ?? null,
    address: body.address ?? null,
    dateOfBirth: body.dateOfBirth ?? null,
    gender: body.gender ?? null,
  })
  return unwrapProfile(res)
}

/** Chuẩn hoá SĐT VN — khớp logic `UpdateProfileRequest.normalizeVnPhone` (backend). */
export function normalizeVNPhoneForApi(raw: string): string | null {
  if (!raw?.trim()) return null
  let t = raw.trim().replace(/\s+/g, '')
  if (t.startsWith('+84')) {
    t = '0' + t.slice(3).replace(/\D/g, '')
  } else if (t.startsWith('84') && t.length >= 2) {
    const digits = t.replace(/\D/g, '')
    if (digits.startsWith('84') && digits.length >= 11) {
      t = '0' + digits.slice(2, 11)
    } else if (digits.startsWith('84') && digits.length === 10) {
      t = '0' + digits.slice(2)
    } else {
      t = digits
    }
  } else {
    t = t.replace(/\D/g, '')
  }
  if (t.length === 10 && t.startsWith('0')) return t
  return null
}

/** Thống kê dashboard — GET /users/me/stats (đếm từ DB). */
export interface CustomerStats {
  savedVehicles: number
  upcomingBookings: number
  activeDeposits: number
  totalOrders: number
}

function unwrapCustomerStats(res: unknown): CustomerStats {
  const r = res as ApiResponse<CustomerStats> | CustomerStats
  const d =
    r && typeof r === 'object' && 'data' in r
      ? (r as ApiResponse<CustomerStats>).data
      : (r as CustomerStats)
  if (!d || typeof d !== 'object') throw new Error('STATS_PARSE')
  const o = d as Record<string, unknown>
  const num = (key: string) => {
    const v = o[key]
    const x = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(x) ? x : 0
  }
  return {
    savedVehicles: num('savedVehicles'),
    upcomingBookings: num('upcomingBookings'),
    activeDeposits: num('activeDeposits'),
    totalOrders: num('totalOrders'),
  }
}

export async function fetchCustomerStats(): Promise<CustomerStats> {
  const res = await axiosInstance.get<unknown>('/users/me/stats')
  return unwrapCustomerStats(res)
}

export async function uploadMyAvatar(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('avatar', file)
  const res = (await axiosInstance.post<unknown>('/users/me/avatar', fd)) as
    | ApiResponse<{ avatarUrl: string }>
    | { avatarUrl: string }
  const data =
    res && typeof res === 'object' && 'data' in res
      ? (res as ApiResponse<{ avatarUrl: string }>).data
      : (res as { avatarUrl: string })
  if (!data?.avatarUrl) throw new Error('AVATAR_URL_MISSING')
  return data.avatarUrl
}
