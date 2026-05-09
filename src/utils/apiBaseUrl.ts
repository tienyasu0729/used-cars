/**
 * Chuẩn hóa base URL cho axios trong trình duyệt.
 * - Dev: có thể dùng URL tuyệt đối `http://127.0.0.1:8080/api/v1` để gọi thẳng Spring (không qua proxy Vite).
 * - Nếu thiếu "/" đầu (vd. `api/v1`), axios resolve path tương đối theo route → lệch khỏi proxy `/api` → 404.
 */
export function normalizeApiBaseUrl(
  raw: string | undefined,
  fallback = '/api/v1',
): string {
  const v = (raw ?? '').trim()
  const base = v.length > 0 ? v : fallback
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/\/+$/, '') || fallback
  }
  if (base.startsWith('//')) {
    return base.replace(/\/+$/, '') || fallback
  }
  const withLeading = base.startsWith('/') ? base : `/${base}`
  return withLeading.replace(/\/+$/, '') || fallback
}

/**
 * Khi baseURL đã kết thúc bằng `/api/v1`, path request phải là `/deposits` chứ không phải `/api/v1/deposits`.
 * Axios combineURLs sẽ tạo `.../api/v1/api/v1/deposits` → Spring không có route → 404.
 */
export function stripDuplicateApiV1Path(
  baseURL: string | undefined,
  url: string | undefined,
): string | undefined {
  if (!url || !baseURL) return url
  const b = baseURL.replace(/\/+$/, '')
  if (!/\/api\/v1$/i.test(b)) return url
  const q = url.indexOf('?')
  const path = q >= 0 ? url.slice(0, q) : url
  const query = q >= 0 ? url.slice(q) : ''
  if (!/^\/api\/v1(\/|$)/i.test(path)) return url
  const next = path.replace(/^\/api\/v1(\/|$)/i, '/')
  const merged = (next === '' ? '/' : next) + query
  return merged
}

/**
 * Base URL tuyệt đối có path (vd. `http://127.0.0.1:8080/api/v1`) + `url` bắt đầu bằng `/`
 * (`/deposits`): một số bước resolve URL (RFC 3986 / adapter) có thể coi `/deposits` là path tuyệt đối
 * và thay thế cả path của base → `http://host/deposits` → 404.
 * Bỏ `/` đầu để path được ghép nối đúng thành `.../api/v1/deposits`.
 */
export function fixAbsoluteBaseUrlLeadingSlash(
  baseURL: string | undefined,
  url: string | undefined,
): string | undefined {
  if (!url || !baseURL) return url
  if (!/^https?:\/\//i.test(baseURL)) return url
  if (!url.startsWith('/') || url.startsWith('//')) return url
  try {
    const base = new URL(baseURL)
    const hasNonRootPath = Boolean(base.pathname && base.pathname !== '/')
    if (hasNonRootPath) {
      return url.slice(1)
    }
  } catch {
    /* invalid base URL */
  }
  return url
}
