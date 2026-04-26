/**
 * useRegister Hook — Xử lý toàn bộ logic đăng ký tài khoản
 * 
 * Flow:
 * 1. User submit form → hook gọi authService.register()
 * 2. Thành công → set isSuccess = true (component ẩn form, hiện thông báo)
 * 3. Thất bại → parse lỗi validation từng field / lỗi chung
 * 
 * Tại sao không auto-login sau register:
 * Backend trả HTTP 201 với message thành công, không trả token.
 * User cần verify email trước (dù backend chưa implement email gửi thật).
 */

import { useState, useCallback } from 'react'
import authService from '@/services/auth.service'
import type { RegisterRequest, ApiErrorResponse } from '@/types/auth.types'

interface UseRegisterReturn {
  /** Gọi hàm này khi submit form đăng ký */
  register: (registerData: RegisterRequest) => Promise<void>
  /** true khi đang gọi API register */
  isLoading: boolean
  /** Lỗi chung (ví dụ: "Đăng ký thất bại") */
  error: string | null
  /** Lỗi theo từng field (ví dụ: { email: "Email đã tồn tại" }) */
  fieldErrors: Record<string, string>
  /** true khi đăng ký thành công — dùng để ẩn form, hiện thông báo */
  isSuccess: boolean
  /** Message thành công từ server */
  successMessage: string
  /** Xóa tất cả lỗi */
  clearErrors: () => void
  /** Reset toàn bộ state về ban đầu (dùng khi user muốn thử lại) */
  resetState: () => void
}

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const register = useCallback(async (registerData: RegisterRequest) => {
    // Reset state cũ trước khi gọi API
    setError(null)
    setFieldErrors({})
    setIsSuccess(false)
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const result = await authService.register(registerData)

      // Đăng ký thành công → hiện thông báo, ẩn form
      setIsSuccess(true)
      setSuccessMessage(result.message)
    } catch (err) {
      const apiError = err as ApiErrorResponse

      if (apiError.errorCode === 'VALIDATION_FAILED' && apiError.errors) {
        // Parse lỗi từng field (VD: email đã tồn tại, phone sai format)
        const parsedFieldErrors: Record<string, string> = {}
        apiError.errors.forEach((validationError) => {
          parsedFieldErrors[validationError.field] = validationError.message
        })
        setFieldErrors(parsedFieldErrors)

        // Nếu có lỗi email trùng, hiện thêm message chung rõ ràng
        if (parsedFieldErrors['email']) {
          setError(`Email: ${parsedFieldErrors['email']}`)
        }
      } else {
        // Lỗi khác (server error, network, v.v.)
        setError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại sau.')
      }

      console.error('[useRegister] Register failed:', apiError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearErrors = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  const resetState = useCallback(() => {
    setError(null)
    setFieldErrors({})
    setIsSuccess(false)
    setSuccessMessage('')
    setIsLoading(false)
  }, [])

  return {
    register,
    isLoading,
    error,
    fieldErrors,
    isSuccess,
    successMessage,
    clearErrors,
    resetState,
  }
}
