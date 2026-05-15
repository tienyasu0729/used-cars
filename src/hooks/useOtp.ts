import { useState, useRef, useEffect, useCallback } from 'react'
import { otpService } from '@/services/otp.service'
import type { OtpReferenceType, OtpErrorResponse } from '@/types/otp.types'
import {
  OTP_EXPIRY_SECONDS,
  RESEND_COOLDOWN_SECONDS,
  MAX_RESEND_COUNT,
} from '@/types/otp.types'

interface UseOtpState {
  otpSent: boolean
  isRequesting: boolean
  isVerifying: boolean
  error: string | null
  remainingTime: number
  resendCooldown: number
  resendCount: number
}

interface UseOtpActions {
  requestOtp: (phone: string, referenceType: OtpReferenceType) => Promise<boolean>
  verifyOtp: (phone: string, otpCode: string, referenceType: OtpReferenceType) => Promise<boolean>
  resendOtp: (phone: string, referenceType: OtpReferenceType) => Promise<boolean>
  resetOtp: () => void
  startTimerManually: () => void
}

export type UseOtpReturn = UseOtpState & UseOtpActions

function mapErrorToVietnamese(err: OtpErrorResponse): string {
  switch (err.errorCode) {
    case 'OTP_INVALID_CODE':
      return `Mã OTP không chính xác. Bạn còn ${err.remainingAttempts ?? 0} lần thử.`
    case 'OTP_EXPIRED':
      return 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.'
    case 'OTP_EXHAUSTED':
      return 'Đã vượt quá số lần thử cho phép. Vui lòng yêu cầu mã mới.'
    case 'OTP_RATE_LIMITED':
      return `Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau ${err.retryAfterSeconds ?? 0} giây.`
    case 'OTP_ALREADY_EXISTS':
      return 'Mã OTP đã được gửi. Vui lòng kiểm tra tin nhắn SMS.'
    case 'STAFF_PHONE_EXISTS':
      return 'Số điện thoại đã được sử dụng bởi tài khoản khác.'
    case 'NETWORK_ERROR':
    case 'NETWORK_TIMEOUT':
      return 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.'
    default:
      return 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.'
  }
}

const initialState: UseOtpState = {
  otpSent: false,
  isRequesting: false,
  isVerifying: false,
  error: null,
  remainingTime: 0,
  resendCooldown: 0,
  resendCount: 0,
}

export function useOtp(): UseOtpReturn {
  const [state, setState] = useState<UseOtpState>(initialState)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback((expirySeconds = OTP_EXPIRY_SECONDS, cooldownSeconds = RESEND_COOLDOWN_SECONDS) => {
    clearTimer()
    setState((prev) => ({
      ...prev,
      remainingTime: expirySeconds,
      resendCooldown: cooldownSeconds,
    }))

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const nextRemaining = prev.remainingTime > 0 ? prev.remainingTime - 1 : 0
        const nextCooldown = prev.resendCooldown > 0 ? prev.resendCooldown - 1 : 0

        if (nextRemaining === 0 && prev.remainingTime > 0) {
          return {
            ...prev,
            remainingTime: 0,
            resendCooldown: nextCooldown,
            error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
          }
        }

        return {
          ...prev,
          remainingTime: nextRemaining,
          resendCooldown: nextCooldown,
        }
      })
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  const requestOtp = useCallback(async (phone: string, referenceType: OtpReferenceType): Promise<boolean> => {
    setState((prev) => ({ ...prev, isRequesting: true, error: null }))
    try {
      await otpService.requestOtp(phone, referenceType)
      setState((prev) => ({
        ...prev,
        otpSent: true,
        isRequesting: false,
        error: null,
      }))
      startTimer()
      return true
    } catch (e) {
      const err = e as OtpErrorResponse
      if (err.errorCode === 'OTP_ALREADY_EXISTS') {
        setState((prev) => ({
          ...prev,
          otpSent: true,
          isRequesting: false,
          error: mapErrorToVietnamese(err),
        }))
        startTimer()
        return true
      }
      setState((prev) => ({
        ...prev,
        isRequesting: false,
        error: mapErrorToVietnamese(err),
      }))
      return false
    }
  }, [startTimer])

  const verifyOtp = useCallback(async (phone: string, otpCode: string, referenceType: OtpReferenceType): Promise<boolean> => {
    setState((prev) => ({ ...prev, isVerifying: true, error: null }))
    try {
      await otpService.verifyOtp(phone, otpCode, referenceType)
      clearTimer()
      setState((prev) => ({
        ...prev,
        isVerifying: false,
        error: null,
      }))
      return true
    } catch (e) {
      const err = e as OtpErrorResponse
      setState((prev) => ({
        ...prev,
        isVerifying: false,
        error: mapErrorToVietnamese(err),
      }))
      return false
    }
  }, [clearTimer])

  const resendOtp = useCallback(async (phone: string, referenceType: OtpReferenceType): Promise<boolean> => {
    if (state.resendCount >= MAX_RESEND_COUNT) return false
    if (state.resendCooldown > 0) return false

    setState((prev) => ({ ...prev, isRequesting: true, error: null }))
    try {
      await otpService.resendOtp(phone, referenceType)
      setState((prev) => ({
        ...prev,
        isRequesting: false,
        resendCount: prev.resendCount + 1,
        error: null,
      }))
      startTimer()
      return true
    } catch (e) {
      const err = e as OtpErrorResponse
      setState((prev) => ({
        ...prev,
        isRequesting: false,
        error: mapErrorToVietnamese(err),
      }))
      return false
    }
  }, [state.resendCount, state.resendCooldown, startTimer])

  const resetOtp = useCallback(() => {
    clearTimer()
    setState(initialState)
  }, [clearTimer])

  const startTimerManually = useCallback(() => {
    setState((prev) => ({ ...prev, otpSent: true }))
    startTimer()
  }, [startTimer])

  return {
    ...state,
    requestOtp,
    verifyOtp,
    resendOtp,
    resetOtp,
    startTimerManually,
  }
}
