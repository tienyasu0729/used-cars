/**
 * Auth Types — Định nghĩa tất cả interface request/response cho module Auth
 * 
 * Các type này map 1:1 với backend API contract (xem IMPLEMENTATION_LOG.md).
 * Không dùng `any` — mọi field đều có type rõ ràng.
 */

// ============================================================
// REQUEST TYPES
// ============================================================

/** Body gửi lên POST /auth/login */
export interface LoginRequest {
  email: string
  password: string
}

/** Body gửi lên POST /auth/register */
export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
}

// ============================================================
// RESPONSE TYPES
// ============================================================

/** 
 * Role hợp lệ trong hệ thống — khớp với bảng Roles trong DB.
 * Backend seed 4 role; "Guest" chỉ dùng ở frontend (chưa đăng nhập).
 */
export type UserRole = 'Customer' | 'SalesStaff' | 'BranchManager' | 'Admin'

/** Thông tin user trả về sau login, nằm trong data.user */
export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string
  role: UserRole
}

/** Cấu trúc data bên trong ApiResponse khi login thành công */
export interface AuthResponse {
  user: UserProfile
  token: string
}

// ============================================================
// API RESPONSE WRAPPER
// ============================================================

/**
 * Wrapper chuẩn cho mọi response thành công từ backend.
 * Backend luôn bọc data trong cấu trúc này (xem API_CONTRACT.md).
 * 
 * Ví dụ: { success: true, code: "SUCCESS", message: "OK", data: { ... } }
 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// ============================================================
// ERROR TYPES
// ============================================================

/** Lỗi validation cho từng field, nằm trong mảng errors[] */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Cấu trúc response khi backend trả lỗi.
 * Các error code quan trọng:
 * - INVALID_CREDENTIALS: sai email/password
 * - ACCOUNT_SUSPENDED: tài khoản bị khóa
 * - VALIDATION_FAILED: input thiếu/sai format (kèm errors[])
 * - UNAUTHORIZED: không có token hoặc token hết hạn
 */
export interface ApiErrorResponse {
  timestamp: string
  status: number
  errorCode: string
  message: string
  path: string
  errors?: ValidationError[]
}
