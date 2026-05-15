import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/utils/unwrapApiResponse'
import type { OtpReferenceType, RequestOtpResponse } from '@/types/otp.types'

const REQUEST_OTP_ENDPOINTS: Record<OtpReferenceType, string> = {
  booking: '/bookings/request-otp',
  deposit: '/deposits/request-otp',
  installment: '/installments/otp/request',
  registration: '/auth/register/request-otp',
}

const VERIFY_OTP_ENDPOINTS: Record<Exclude<OtpReferenceType, 'booking' | 'registration'>, string> = {
  deposit: '/deposits/verify-otp',
  installment: '/installments/otp/verify',
}

type SkipVerifyType = 'booking' | 'registration'

export const otpService = {
  async requestOtp(
    phone: string,
    referenceType: OtpReferenceType,
    referenceId?: string | number,
    email?: string,
  ): Promise<RequestOtpResponse> {
    const endpoint = REQUEST_OTP_ENDPOINTS[referenceType]
    const body: Record<string, unknown> = { phone }

    if (referenceType === 'registration' && email) {
      body.email = email
    }

    if (referenceType === 'installment') {
      body.referenceType = 'installment'
      if (referenceId != null) body.referenceId = referenceId
    }

    const res = (await axiosInstance.post(endpoint, body)) as unknown as ApiResponse<RequestOtpResponse>
    return unwrapApiResponse(res)
  },

  async verifyOtp(
    phone: string,
    otpCode: string,
    referenceType: OtpReferenceType,
    options?: { depositData?: Record<string, unknown>; referenceId?: string | number },
  ): Promise<unknown> {
    const skipVerifyTypes: SkipVerifyType[] = ['booking', 'registration']
    if (skipVerifyTypes.includes(referenceType as SkipVerifyType)) {
      return Promise.resolve()
    }

    const endpoint = VERIFY_OTP_ENDPOINTS[referenceType]
    const body: Record<string, unknown> = { phone, otpCode }

    if (referenceType === 'deposit' && options?.depositData) {
      body.depositData = options.depositData
    }

    if (referenceType === 'installment') {
      body.referenceType = 'installment'
      if (options?.referenceId != null) body.referenceId = options.referenceId
    }

    const res = (await axiosInstance.post(endpoint, body)) as unknown as ApiResponse<unknown>
    return unwrapApiResponse(res)
  },

  async resendOtp(
    phone: string,
    referenceType: OtpReferenceType,
    referenceId?: string | number,
  ): Promise<RequestOtpResponse> {
    if (referenceType === 'installment') {
      const body: Record<string, unknown> = {
        phone,
        referenceType: 'installment',
      }
      if (referenceId != null) body.referenceId = referenceId

      const res = (await axiosInstance.post('/installments/otp/resend', body)) as unknown as ApiResponse<RequestOtpResponse>
      return unwrapApiResponse(res)
    }

    return otpService.requestOtp(phone, referenceType, referenceId)
  },
}
