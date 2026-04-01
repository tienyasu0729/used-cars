/**
 * Upload ảnh lên Cloudinary (unsigned preset) — chỉ dùng khi đủ biến môi trường Vite.
 * Không gọi khi chưa cấu hình; form đăng xe vẫn gửi images: [].
 */

export function isCloudinaryConfigured(): boolean {
  const cloud = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '').trim()
  const preset = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '').trim()
  return Boolean(cloud && preset)
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '').trim()
  const preset = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '').trim()
  if (!cloudName || !preset) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Upload thất bại (${res.status})`)
  }

  const data = (await res.json()) as { secure_url?: string; url?: string }
  const url = data.secure_url || data.url
  if (!url || typeof url !== 'string') {
    throw new Error('Phản hồi Cloudinary không có URL ảnh')
  }
  return url
}
