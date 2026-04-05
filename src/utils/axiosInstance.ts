/**
 * Axios Instance — Cấu hình axios dùng chung cho toàn app
 * 
 * Tại sao tạo riêng thay vì dùng apiClient.ts cũ:
 * - apiClient.ts cũ không handle response unwrap (ApiResponse wrapper)
 * - Không xử lý auto-redirect khi token hết hạn (401)
 * - localStorage key khác spec ("token" vs "auth_token")
 * 
 * File này dùng cho các service mới; file cũ vẫn giữ lại để không break code khác.
 */

import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from '@/types/auth.types'
import { useSessionRevokedStore } from '@/store/sessionRevokedStore'
import { shouldOpenAccountSuspendedModal } from '@/utils/accountSuspendedModalPolicy'
import { getStoredAuthToken } from '@/utils/authToken'
import {
  fixAbsoluteBaseUrlLeadingSlash,
  normalizeApiBaseUrl,
  stripDuplicateApiV1Path,
} from '@/utils/apiBaseUrl'

const baseURL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

const parsedTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)
const requestTimeoutMs =
  Number.isFinite(parsedTimeout) && parsedTimeout > 0
    ? parsedTimeout
    : import.meta.env.DEV
      ? 60000
      : 30000

/** Ghép base + path giống combineURLs của axios (sau interceptor url có thể là `deposits` không có `/` đầu). */
function approxCombinedPath(baseURL: string | undefined, url: string | undefined): string {
  if (!url) return (baseURL ?? '').split('?')[0]
  if (!baseURL) return url.split('?')[0]
  if (/^https?:\/\//i.test(url)) return url.split('?')[0]
  const b = baseURL.replace(/\/?\/$/, '')
  const relative = url.split('?')[0].replace(/^\/+/, '')
  return `${b}/${relative}`
}

function apiV1PathAfterPrefix(config: InternalAxiosRequestConfig | undefined): string | null {
  if (!config) return null
  const full = approxCombinedPath(config.baseURL, config.url)
  const marker = '/api/v1/'
  const idx = full.indexOf(marker)
  if (idx < 0) return null
  return full.slice(idx + marker.length)
}

function isOptionalAuthPublicApi(config: InternalAxiosRequestConfig | undefined): boolean {
  const path = apiV1PathAfterPrefix(config)
  if (!path || !config) return false
  const m = (config.method ?? 'get').toLowerCase()
  if (m === 'post' && /^vehicles\/\d+\/view$/.test(path)) return true
  if (m !== 'get') return false
  if (path === 'vehicles') return true
  if (/^vehicles\/\d+$/.test(path)) return true
  if (path === 'vehicles/recently-viewed') return true
  if (path.startsWith('vehicles/compare')) return true
  if (path.startsWith('catalog/')) return true
  if (path === 'branches') return true
  if (path.startsWith('branches/')) return true
  if (path === 'bookings/available-slots') return true
  return false
}

const axiosInstance = axios.create({
  baseURL,
  /** Luôn ghép url tương đối với baseURL; tránh bỏ qua base với allowAbsoluteUrls mặc định (axios ≥1.7). */
  allowAbsoluteUrls: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: requestTimeoutMs,
})

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
// Mỗi request gửi đi sẽ tự gắn token JWT vào header Authorization.
// Token lấy từ localStorage key "auth_token" (key cố định theo spec).
axiosInstance.interceptors.request.use(
  (config) => {
    const fixedDup = stripDuplicateApiV1Path(config.baseURL, config.url)
    if (fixedDup !== undefined) config.url = fixedDup

    const fixedSlash = fixAbsoluteBaseUrlLeadingSlash(config.baseURL, config.url)
    if (fixedSlash !== undefined) config.url = fixedSlash

    const authToken = getStoredAuthToken()
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    // FormData cần boundary tự sinh — không gửi application/json mặc định
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================================
// RESPONSE INTERCEPTOR 
// ============================================================
// Xử lý 2 case chính:
// 1. Response thành công → unwrap bỏ axios wrapper, trả thẳng response.data
//    (response.data ở đây là ApiResponse<T> từ backend)
// 2. Response lỗi → parse error code và xử lý theo từng case
axiosInstance.interceptors.response.use(
  (response) => {
    // Trả thẳng data từ backend (đã là ApiResponse<T>)
    return response.data
  },
  (error) => {
    if (!error.response) {
      const msg = String(error.message ?? '')
      const isTimeout =
        error.code === 'ECONNABORTED' || /timeout/i.test(msg)
      console.error('[axiosInstance] Lỗi kết nối mạng:', msg, error.code ?? '')
      return Promise.reject({
        errorCode: isTimeout ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? `Hết thời gian chờ máy chủ (${requestTimeoutMs / 1000}s). Kiểm tra backend đang chạy, proxy/ngrok và thử lại.`
          : 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng và địa chỉ API.',
        status: 0,
      } as Partial<ApiErrorResponse>)
    }

    const errorData = error.response.data as ApiErrorResponse

    if (error.response.status === 403 && errorData?.errorCode === 'ACCOUNT_SUSPENDED') {
      if (shouldOpenAccountSuspendedModal(error.config)) {
        useSessionRevokedStore.getState().openBlocking(errorData.message)
      }
    }

    // Nếu lỗi 401 (UNAUTHORIZED) → token hết hạn hoặc không hợp lệ
    // Xóa token và redirect về trang login
    if (error.response.status === 401 && errorData?.errorCode === 'UNAUTHORIZED') {
      if (isOptionalAuthPublicApi(error.config)) {
        return Promise.reject(errorData)
      }
      console.warn('[axiosInstance] Token hết hạn, xóa session và redirect /login')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token')
      localStorage.removeItem('auth_user')

      // Chỉ redirect nếu đang không ở trang login (tránh loop)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Throw lại error data để các hook/service xử lý cụ thể
    // (ví dụ: VALIDATION_FAILED → hiện lỗi từng field)
    return Promise.reject(errorData)
  }
)

export default axiosInstance
