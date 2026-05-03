import { api } from './apiClient'
import type { CloudinarySignedUpload } from './managerMedia.service'
import { assertCloudinaryImageSize } from '@/utils/uploadLimits'

export type HomeBannerPublic = { id: number; imageUrl: string; sortOrder: number }

export type HomeBannerAdmin = {
  id: number
  imageUrl: string
  cloudinaryPublicId: string | null
  sortOrder: number
  createdAt: string
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export async function fetchPublicHomeBanners(): Promise<HomeBannerPublic[]> {
  const res = await api.get<unknown>('/catalog/home-banners')
  const d = unwrap<HomeBannerPublic[]>(res.data)
  return Array.isArray(d) ? d : []
}

export async function fetchAdminHomeBanners(): Promise<HomeBannerAdmin[]> {
  const res = await api.get<unknown>('/admin/home-banners')
  const d = unwrap<HomeBannerAdmin[]>(res.data)
  return Array.isArray(d) ? d : []
}

export async function fetchAdminHomeBannerUploadSignature(): Promise<CloudinarySignedUpload> {
  const res = await api.get<unknown>('/admin/home-banners/upload-signature')
  return unwrap<CloudinarySignedUpload>(res.data)
}

export async function createAdminHomeBanner(body: {
  imageUrl: string
  cloudinaryPublicId?: string | null
}): Promise<HomeBannerAdmin> {
  const res = await api.post<unknown>('/admin/home-banners', body)
  return unwrap<HomeBannerAdmin>(res.data)
}

export async function deleteAdminHomeBanner(id: number): Promise<void> {
  await api.delete(`/admin/home-banners/${id}`)
}

async function postFileToCloudinary(file: File, sig: CloudinarySignedUpload): Promise<{ secureUrl: string; publicId: string }> {
  assertCloudinaryImageSize(file)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)
  if (sig.publicId) fd.append('public_id', sig.publicId)
  if (sig.overwrite) fd.append('overwrite', 'true')
  const res = await fetch(sig.uploadUrl, { method: 'POST', body: fd })
  const text = await res.text()
  let json: { secure_url?: string; public_id?: string; error?: { message?: string } }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    throw new Error(`Cloudinary phản hồi không hợp lệ (${res.status})`)
  }
  if (!res.ok) {
    throw new Error(json.error?.message ?? text.slice(0, 200))
  }
  const secureUrl = json.secure_url
  const publicId = json.public_id
  if (!secureUrl) throw new Error('Thiếu secure_url')
  if (!publicId) throw new Error('Thiếu public_id')
  return { secureUrl, publicId }
}

export async function uploadHomeBannerImage(file: File): Promise<{ secureUrl: string; publicId: string }> {
  const sig = await fetchAdminHomeBannerUploadSignature()
  return postFileToCloudinary(file, sig)
}
