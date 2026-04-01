/**
 * Quy tắc mật khẩu tài khoản — dùng chung cho đăng ký / đổi mật khẩu.
 *
 * - Đăng ký: khớp RegisterRequest (@Size min = 8, max = 100).
 * - Đổi mật khẩu: `ChangePasswordRequest` + `AuthService` dùng **8–100 ký tự**
 *   (đồng bộ `RegisterRequest.password`).
 */

export const ACCOUNT_PASSWORD_MIN_LENGTH = 8
export const ACCOUNT_PASSWORD_MAX_LENGTH = 100

/** Cùng câu chữ với message Bean Validation của RegisterRequest.password */
export const ACCOUNT_PASSWORD_RANGE_MESSAGE = `Mật khẩu từ ${ACCOUNT_PASSWORD_MIN_LENGTH} đến ${ACCOUNT_PASSWORD_MAX_LENGTH} ký tự.`

export const ACCOUNT_PASSWORD_PLACEHOLDER = `Tối thiểu ${ACCOUNT_PASSWORD_MIN_LENGTH} ký tự`

/** Giống RegisterForm — xác nhận mật khẩu */
export const PASSWORD_CONFIRM_MISMATCH_MESSAGE = 'Mật khẩu xác nhận không khớp'

/**
 * Kiểm tra độ dài mật khẩu mới (đã nhập ký tự).
 * @returns message lỗi hoặc undefined nếu hợp lệ
 */
export function validateAccountPasswordLength(password: string): string | undefined {
  if (password.length < ACCOUNT_PASSWORD_MIN_LENGTH || password.length > ACCOUNT_PASSWORD_MAX_LENGTH) {
    return ACCOUNT_PASSWORD_RANGE_MESSAGE
  }
  return undefined
}

/**
 * Mật khẩu mới / đăng ký: bắt buộc + độ dài.
 */
export function validateNewAccountPassword(password: string): string | undefined {
  if (!password.trim()) {
    return 'Mật khẩu không được để trống.'
  }
  return validateAccountPasswordLength(password)
}
