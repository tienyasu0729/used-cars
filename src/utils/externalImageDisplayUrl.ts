/**
 * Một số host trả HTML thay vì bytes ảnh — <img src> cần URL trỏ trực tiếp tới file.
 * Google Drive: link …/file/d/{id}/view… hoặc /open?id=… là trang web, không phải ảnh.
 */
export function externalImageDisplayUrl(raw: string): string {
  const u = raw.trim()
  if (!u) return u
  try {
    const url = new URL(u)
    const host = url.hostname.toLowerCase()
    if (host !== 'drive.google.com') {
      return u
    }
    const fileMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) {
      return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`
    }
    if (url.pathname === '/open') {
      const id = url.searchParams.get('id')
      if (id) {
        return `https://drive.google.com/uc?export=view&id=${id}`
      }
    }
  } catch {
    /* URL không hợp lệ */
  }
  return u
}
