import { useState, useEffect, useRef } from 'react'
import { useOtp } from '@/hooks/useOtp'
import { formatCountdown } from '@/utils/formatCountdown'
import type { OtpReferenceType } from '@/types/otp.types'
import { OTP_LENGTH, MAX_RESEND_COUNT } from '@/types/otp.types'

interface OtpVerificationStepProps {
  phone: string
  maskedPhone: string
  referenceType: OtpReferenceType
  onVerified: (otpCode: string) => void
  onBack: () => void
}

export function OtpVerificationStep({
  phone,
  maskedPhone,
  referenceType,
  onVerified,
  onBack,
}: OtpVerificationStepProps) {
  const [otpCode, setOtpCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    isRequesting,
    isVerifying,
    error,
    remainingTime,
    resendCooldown,
    resendCount,
    requestOtp,
    verifyOtp,
    resendOtp,
    startTimerManually,
  } = useOtp()

  useEffect(() => {
    if (referenceType === 'registration') {
      startTimerManually()
    } else {
      void requestOtp(phone, referenceType)
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= OTP_LENGTH) {
      setOtpCode(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < OTP_LENGTH || isVerifying || remainingTime === 0) return
    const success = await verifyOtp(phone, otpCode, referenceType)
    if (success) {
      onVerified(otpCode)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resendCount >= MAX_RESEND_COUNT) return
    setOtpCode('')
    await resendOtp(phone, referenceType)
    inputRef.current?.focus()
  }

  const isConfirmDisabled = otpCode.length < OTP_LENGTH || isVerifying || remainingTime === 0
  const isExpired = remainingTime === 0 && !isRequesting

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
      >
        <span>←</span>
        <span>Quay lại</span>
      </button>

      <div>
        <h3 className="text-lg font-bold text-slate-800">Xác thực số điện thoại</h3>
        <p className="mt-1 text-sm text-slate-600">
          Mã OTP đã gửi đến <span className="font-medium">{maskedPhone}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            pattern="[0-9]*"
            value={otpCode}
            onChange={handleChange}
            disabled={isExpired}
            placeholder="Nhập mã OTP 6 chữ số"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg tracking-widest focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E] disabled:bg-slate-100 disabled:text-slate-400"
            autoComplete="one-time-code"
          />
        </div>

        {!isExpired && remainingTime > 0 && (
          <p className="text-center text-sm text-slate-600">
            Mã hết hạn sau: <span className="font-medium">{formatCountdown(remainingTime)}</span>
          </p>
        )}

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isConfirmDisabled}
          className="w-full rounded-lg bg-[#1A3C6E] py-3 font-bold text-white hover:bg-[#15325A] disabled:opacity-60"
        >
          {isVerifying ? 'Đang xác thực...' : 'Xác nhận'}
        </button>
      </form>

      <div className="text-center">
        {resendCount >= MAX_RESEND_COUNT ? (
          <p className="text-sm text-slate-500">Đã hết lượt gửi lại mã</p>
        ) : resendCooldown > 0 ? (
          <button type="button" disabled className="text-sm text-slate-400">
            Gửi lại mã ({resendCooldown}s)
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isRequesting}
            className="text-sm font-medium text-[#1A3C6E] hover:underline disabled:opacity-60"
          >
            Gửi lại mã
          </button>
        )}
      </div>

      {isRequesting && (
        <p className="text-center text-sm text-slate-500">Đang gửi mã OTP...</p>
      )}
    </div>
  )
}
