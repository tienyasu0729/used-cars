/**
 * Hybrid upload: backend ký → client POST trực tiếp lên Cloudinary → URL dùng trong API nghiệp vụ.
 */
import axiosInstance from '@/utils/axiosInstance'

function unwrapData<T>(res: unknown): T {
  const r = res as { data?: T }
  if (r && typeof r === 'object' && 'data' in r && r.data !== undefined) {
    return r.data as T
  }
  return res as T
}

export interface CloudinarySignedUpload {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  publicId: string | null
  overwrite: boolean
  uploadUrl: string
  resourceType: string
}

/** Backend đã cấu hình CLOUDINARY_* hay chưa (GET không lộ secret). */
export async function fetchMediaUploadEnabled(): Promise<boolean> {
  try {
    const raw = await axiosInstance.get<unknown>('/manager/media/status')
    const d = unwrapData<{ enabled?: boolean; hybridUpload?: boolean }>(raw)
    return Boolean(d?.enabled)
  } catch {
    return false
  }
}

async function fetchManagerUploadSignature(): Promise<CloudinarySignedUpload> {
  const raw = await axiosInstance.get<unknown>('/manager/media/upload-signature')
  return unwrapData<CloudinarySignedUpload>(raw)
}

/** POST multipart tới Cloudinary (không qua backend). */
async function postFileToCloudinary(
  file: File,
  sig: CloudinarySignedUpload,
): Promise<string> {
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
  const res = await fetch(sig.uploadUrl, {
    method: 'POST',
    body: fd,
  })
  const text = await res.text()
  let json: { secure_url?: string; error?: { message?: string } }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    throw new Error(`Cloudinary phản hồi không hợp lệ (${res.status})`)
  }
  if (!res.ok) {
    const msg = json.error?.message ?? text.slice(0, 200)
    throw new Error(msg || `Upload thất bại (${res.status})`)
  }
  const url = json.secure_url
  if (!url || typeof url !== 'string') {
    throw new Error('Phản hồi upload không có secure_url')
  }
  return url
}

export async function uploadManagerImage(file: File): Promise<string> {
  const sig = await fetchManagerUploadSignature()
  return postFileToCloudinary(file, sig)
}
