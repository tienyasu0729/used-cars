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

// Đọc base URL từ biến môi trường Vite, fallback qua proxy khi dev
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/**
 * GET công khai (permitAll trên backend) — nếu vì lý do định tuyến / filter mà trả 401,
 * không được xóa JWT và ép về /login (ảnh hưởng manager/staff vẫn gửi Bearer khi xem trang chủ).
 */
function isPublicCatalogGet(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config) return false
  const m = (config.method ?? 'get').toLowerCase()
  if (m !== 'get') return false
  const full = `${config.baseURL ?? ''}${config.url ?? ''}`.split('?')[0]
  const marker = '/api/v1/'
  const idx = full.indexOf(marker)
  if (idx < 0) return false
  const path = full.slice(idx + marker.length)
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
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 giây timeout tránh treo request
})

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
// Mỗi request gửi đi sẽ tự gắn token JWT vào header Authorization.
// Token lấy từ localStorage key "auth_token" (key cố định theo spec).
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('auth_token')
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
    // Nếu không có response (network error, timeout)
    if (!error.response) {
      console.error('[axiosInstance] Lỗi kết nối mạng:', error.message)
      return Promise.reject({
        errorCode: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
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
      if (isPublicCatalogGet(error.config)) {
        return Promise.reject(errorData)
      }
      console.warn('[axiosInstance] Token hết hạn, xóa session và redirect /login')
      localStorage.removeItem('auth_token')
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
