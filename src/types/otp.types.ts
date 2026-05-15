export type OtpReferenceType = 'booking' | 'deposit' | 'installment' | 'registration'

export interface RequestOtpResponse {
  otpId: string
  expiresAt: string
  message: string
}

export interface OtpErrorResponse {
  errorCode: string
  message: string
  remainingAttempts?: number
  retryAfterSeconds?: number
  expiresAt?: string
}

export const OTP_EXPIRY_SECONDS = 300
export const RESEND_COOLDOWN_SECONDS = 60
export const MAX_RESEND_COUNT = 3
export const OTP_LENGTH = 6
