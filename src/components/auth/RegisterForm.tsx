import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useRegister } from '@/hooks/useRegister'
import { useLogin } from '@/hooks/useLogin'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { OtpVerificationStep } from '@/components/otp/OtpVerificationStep'
import { Button, Input } from '@/components/ui'
import { maskPhone } from '@/utils/maskPhone'
import type { RegisterRequest } from '@/types/auth.types'
import {
  ACCOUNT_PASSWORD_PLACEHOLDER,
  PASSWORD_CONFIRM_MISMATCH_MESSAGE,
  validateNewAccountPassword,
} from '@/lib/auth/passwordRules'

const VN_PHONE_REGEX = /^0\d{9}$/
type RegistrationStep = 'form' | 'otp'

export function RegisterForm() {
  const [step, setStep] = useState<RegistrationStep>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [clientFieldErrors, setClientFieldErrors] = useState<Record<string, string>>({})

  const {
    register, requestRegistrationOtp, isLoading, isRequestingOtp,
    error, fieldErrors, isSuccess, successMessage, clearErrors,
  } = useRegister()
  const { googleLogin, isLoading: isGoogleLoading, error: googleError } = useLogin()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClientFieldErrors({})
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Họ tên không được để trống.'
    if (!email.trim()) errs.email = 'Email không được để trống.'
    if (!phone.trim()) errs.phone = 'Số điện thoại không được để trống.'
    else if (!VN_PHONE_REGEX.test(phone.trim().replace(/\s/g, '')))
      errs.phone = 'Số điện thoại phải đúng 10 chữ số và bắt đầu bằng 0.'
    if (Object.keys(errs).length > 0) { setClientFieldErrors(errs); return }
    const pwdErr = validateNewAccountPassword(password)
    if (pwdErr) { setClientFieldErrors({ password: pwdErr }); return }
    if (password !== confirmPassword) {
      setClientFieldErrors({ confirmPassword: PASSWORD_CONFIRM_MISMATCH_MESSAGE }); return
    }
    const result = await requestRegistrationOtp(phone.trim(), email.trim())
    if (result) setStep('otp')
  }

  const handleOtpVerified = async (otpCode: string) => {
    const data: RegisterRequest = {
      name: name.trim(), email: email.trim(), phone: phone.trim(), password, otpCode,
    }
    const success = await register(data)
    if (!success) {
      setStep('form')
    }
  }

  const handleOtpBack = () => { setStep('form'); clearErrors() }

  if (isSuccess) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="text-green-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-900">Đăng Ký Thành Công!</h2>
          <p className="text-gray-600">
            {successMessage || 'Tài khoản đã tạo. Vui lòng kiểm tra email xác thực.'}
          </p>
          <Link to="/login" className="mt-4 inline-block rounded-lg bg-[#1A3C6E] px-6 py-2 text-white hover:bg-[#1A3C6E]/90 transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <OtpVerificationStep
          phone={phone.trim()}
          maskedPhone={maskPhone(phone.trim())}
          referenceType="registration"
          onVerified={handleOtpVerified}
          onBack={handleOtpBack}
        />
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin" size={16} />
            <span>Đang tạo tài khoản...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Tạo Tài Khoản Mới</h1>
      <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
        <Input
          id="register-name" label="Họ và tên" value={name}
          onChange={(e) => { setName(e.target.value); setClientFieldErrors((p) => ({ ...p, name: '' })); clearErrors() }}
          placeholder="Nguyễn Văn A" error={fieldErrors['name'] || clientFieldErrors['name']}
          required autoComplete="name"
        />
        <Input
          id="register-email" label="Email" type="email" value={email}
          onChange={(e) => { setEmail(e.target.value); setClientFieldErrors((p) => ({ ...p, email: '' })); clearErrors() }}
          placeholder="email@example.com" error={fieldErrors['email'] || clientFieldErrors['email']}
          required autoComplete="email"
        />
        <Input
          id="register-phone" label="Số điện thoại" type="tel" value={phone}
          onChange={(e) => { setPhone(e.target.value); setClientFieldErrors((p) => ({ ...p, phone: '' })); clearErrors() }}
          placeholder="0905123456" error={fieldErrors['phone'] || clientFieldErrors['phone']}
          required autoComplete="tel"
        />
        <div>
          <div className="relative">
            <Input
              id="register-password" label="Mật khẩu"
              type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => { setPassword(e.target.value); setClientFieldErrors({}); clearErrors() }}
              placeholder={ACCOUNT_PASSWORD_PLACEHOLDER}
              error={fieldErrors['password'] || clientFieldErrors['password']}
              required autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              tabIndex={-1} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>
        <div className="relative">
          <Input
            id="register-confirm-password" label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setClientFieldErrors({}) }}
            placeholder="Nhập lại mật khẩu" error={clientFieldErrors['confirmPassword']}
            required autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1} aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && Object.keys(fieldErrors).length === 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button id="register-submit" type="submit" variant="primary" className="w-full"
          disabled={isRequestingOtp || !name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword}>
          {isRequestingOtp ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />Đang gửi mã OTP...
            </span>
          ) : 'Tiếp tục'}
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-500">hoặc</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>
      <GoogleLoginButton isLoading={isRequestingOtp || isGoogleLoading} onGoogleLogin={googleLogin} />
      {googleError && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{googleError}</p>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#E8612A] hover:underline">Đăng nhập</Link>
      </p>
    </div>
  )
}
