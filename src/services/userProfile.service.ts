/**
 * Hồ sơ user đăng nhập — GET/PUT /users/me; avatar: hybrid (GET signature → Cloudinary → PUT URL).
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
  const o = d as unknown as Record<string, unknown>
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

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

function assertAvatarFile(file: File): void {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('AVATAR_TOO_LARGE')
  }
  const t = file.type.toLowerCase()
  if (t !== 'image/jpeg' && t !== 'image/png') {
    throw new Error('AVATAR_TYPE')
  }
}

/** Ký từ backend — khớp {@link CloudinarySignedUpload} manager. */
interface AvatarUploadSignature {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  publicId: string | null
  overwrite: boolean
  uploadUrl: string
}

export async function uploadMyAvatar(file: File): Promise<string> {
  assertAvatarFile(file)
  const sigRes = await axiosInstance.get<unknown>('/users/me/avatar/upload-signature')
  const sig = ((): AvatarUploadSignature => {
    const raw = sigRes.data
    const r = raw as ApiResponse<AvatarUploadSignature> | AvatarUploadSignature | null | undefined
    if (r && typeof r === 'object' && 'data' in r && r.data) {
      return r.data as AvatarUploadSignature
    }
    if (r && typeof r === 'object' && 'apiKey' in r && 'signature' in r) {
      return r as AvatarUploadSignature
    }
    throw new Error('AVATAR_SIG_PARSE')
  })()

  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)
  if (sig.publicId) {
    fd.append('public_id', sig.publicId)
  }
  if (sig.overwrite) {
    fd.append('overwrite', 'true')
  }

  const up = await fetch(sig.uploadUrl, { method: 'POST', body: fd })
  const text = await up.text()
  let cloudJson: { secure_url?: string; error?: { message?: string } }
  try {
    cloudJson = JSON.parse(text) as typeof cloudJson
  } catch {
    throw new Error('AVATAR_CLOUDINARY_PARSE')
  }
  if (!up.ok) {
    throw new Error(cloudJson.error?.message ?? 'AVATAR_CLOUDINARY_FAIL')
  }
  const secureUrl = cloudJson.secure_url
  if (!secureUrl || typeof secureUrl !== 'string') {
    throw new Error('AVATAR_URL_MISSING')
  }

  /** Khớp BE `AvatarUploadResponse` — JSON vẫn `{ avatarUrl }` */
  const save = (await axiosInstance.put<unknown>('/users/me/avatar', {
    avatarUrl: secureUrl,
  })) as unknown as ApiResponse<{ avatarUrl: string }> | { avatarUrl: string }
  const data =
    save && typeof save === 'object' && 'data' in save
      ? (save as ApiResponse<{ avatarUrl: string }>).data
      : (save as { avatarUrl: string })
  if (!data?.avatarUrl) throw new Error('AVATAR_URL_MISSING')
  return data.avatarUrl
}
