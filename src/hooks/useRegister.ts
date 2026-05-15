import { useState, useCallback } from 'react'
import authService from '@/services/auth.service'
import { otpService } from '@/services/otp.service'
import type { RegisterRequest, ApiErrorResponse } from '@/types/auth.types'
import type { OtpErrorResponse, RequestOtpResponse } from '@/types/otp.types'

interface UseRegisterReturn {
  register: (registerData: RegisterRequest) => Promise<boolean>
  requestRegistrationOtp: (phone: string, email?: string) => Promise<RequestOtpResponse | null>
  isLoading: boolean
  isRequestingOtp: boolean
  error: string | null
  fieldErrors: Record<string, string>
  isSuccess: boolean
  successMessage: string
  clearErrors: () => void
  resetState: () => void
}

function mapOtpErrorToMessage(err: OtpErrorResponse): string {
  switch (err.errorCode) {
    case 'STAFF_PHONE_EXISTS':
      return 'Số điện thoại đã được sử dụng bởi tài khoản khác.'
    case 'OTP_RATE_LIMITED':
      return `Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau ${err.retryAfterSeconds ?? 0} giây.`
    case 'OTP_ALREADY_EXISTS':
      return 'Mã OTP đã được gửi. Vui lòng kiểm tra tin nhắn SMS.'
    case 'OTP_INVALID_CODE':
      return `Mã OTP không chính xác. Bạn còn ${err.remainingAttempts ?? 0} lần thử.`
    case 'OTP_EXPIRED':
      return 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.'
    case 'OTP_EXHAUSTED':
      return 'Đã vượt quá số lần thử cho phép. Vui lòng yêu cầu mã mới.'
    default:
      return err.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
  }
}

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const requestRegistrationOtp = useCallback(async (phone: string, email?: string): Promise<RequestOtpResponse | null> => {
    setError(null)
    setFieldErrors({})
    setIsRequestingOtp(true)

    try {
      const response = await otpService.requestOtp(phone, 'registration', undefined, email)
      setIsRequestingOtp(false)
      return response
    } catch (err) {
      const apiError = err as ApiErrorResponse
      setIsRequestingOtp(false)

      if (apiError.errorCode === 'VALIDATION_FAILED' && apiError.errors && apiError.errors.length > 0) {
        const parsedFieldErrors: Record<string, string> = {}
        apiError.errors.forEach((e) => {
          parsedFieldErrors[e.field] = e.message
        })
        setFieldErrors(parsedFieldErrors)
        setError(apiError.message || 'Thông tin đăng ký không hợp lệ.')
        return null
      }

      if (apiError.errorCode === 'VALIDATION_FAILED') {
        setError(apiError.message || 'Thông tin đăng ký không hợp lệ.')
        return null
      }

      const otpError = err as OtpErrorResponse
      setError(mapOtpErrorToMessage(otpError))
      return null
    }
  }, [])

  const register = useCallback(async (registerData: RegisterRequest): Promise<boolean> => {
    setError(null)
    setFieldErrors({})
    setIsSuccess(false)
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const result = await authService.register(registerData)
      setIsSuccess(true)
      setSuccessMessage(result.message)
      return true
    } catch (err) {
      const apiError = err as ApiErrorResponse

      if (apiError.errorCode === 'VALIDATION_FAILED' && apiError.errors) {
        const parsedFieldErrors: Record<string, string> = {}
        apiError.errors.forEach((validationError) => {
          parsedFieldErrors[validationError.field] = validationError.message
        })
        setFieldErrors(parsedFieldErrors)

        if (parsedFieldErrors['email']) {
          setError(`Email: ${parsedFieldErrors['email']}`)
        }
      } else if (apiError.errorCode === 'VALIDATION_FAILED') {
        setError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại sau.')
        if (apiError.message?.includes('Email')) {
          setFieldErrors({ email: apiError.message })
        }
      } else if (apiError.errorCode === 'STAFF_PHONE_EXISTS') {
        setFieldErrors({ phone: 'Số điện thoại đã được sử dụng bởi tài khoản khác.' })
        setError('Số điện thoại đã được sử dụng bởi tài khoản khác.')
      } else if (apiError.errorCode === 'OTP_RATE_LIMITED') {
        const otpErr = err as unknown as OtpErrorResponse
        setError(mapOtpErrorToMessage(otpErr))
      } else if (['OTP_INVALID_CODE', 'OTP_EXPIRED', 'OTP_EXHAUSTED'].includes(apiError.errorCode)) {
        const otpErr = err as unknown as OtpErrorResponse
        setError(mapOtpErrorToMessage(otpErr))
      } else {
        setError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại sau.')
      }
      return false
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
    setIsRequestingOtp(false)
  }, [])

  return {
    register,
    requestRegistrationOtp,
    isLoading,
    isRequestingOtp,
    error,
    fieldErrors,
    isSuccess,
    successMessage,
    clearErrors,
    resetState,
  }
}
