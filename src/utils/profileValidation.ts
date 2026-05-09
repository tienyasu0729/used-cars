/**
 * Quy tắc khớp backend `UpdateProfileRequest` (Bean Validation + compact constructor).
 */

/** Họ tên: 2–100 ký tự, chữ Unicode (có dấu), số, khoảng trắng, . ' - */
export const PROFILE_NAME_REGEX_U = /^(?:[\p{L}\p{M}0-9\s.'’\-]){2,100}$/u

export const PROFILE_ADDRESS_MAX_LEN = 500

/** Giống regex địa chỉ backend: không chứa ký tự điều khiển (NUL…US) */
export function profileAddressNoIllegalControlChars(s: string): boolean {
  return !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(s)
}
