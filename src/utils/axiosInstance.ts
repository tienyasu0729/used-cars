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
import type { ApiErrorResponse } from '@/types/auth.types'

// Đọc base URL từ biến môi trường Vite, fallback localhost khi dev
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

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

    // Nếu lỗi 401 (UNAUTHORIZED) → token hết hạn hoặc không hợp lệ
    // Xóa token và redirect về trang login
    if (error.response.status === 401 && errorData?.errorCode === 'UNAUTHORIZED') {
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
