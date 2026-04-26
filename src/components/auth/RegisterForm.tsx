/**
 * RegisterForm — Component form đăng ký tài khoản
 * 
 * Mapping: POST /auth/register
 * 
 * Flow UI:
 * 1. Hiện form đăng ký với các field theo spec
 * 2. Validate client-side: password === confirmPassword
 * 3. Gọi API qua useRegister hook
 * 4. Nếu thành công → ẩn form, hiện thông báo thành công
 * 5. Nếu lỗi → hiện lỗi validation dưới từng field
 * 
 * Chỉ gửi 4 field lên API: name, email, phone, password
 * (backend chỉ chấp nhận 4 field này trong RegisterRequest)
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useRegister } from '@/hooks/useRegister'
import { useLogin } from '@/hooks/useLogin'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { Button, Input } from '@/components/ui'
import type { RegisterRequest } from '@/types/auth.types'
import {
  ACCOUNT_PASSWORD_PLACEHOLDER,
  PASSWORD_CONFIRM_MISMATCH_MESSAGE,
  validateNewAccountPassword,
} from '@/lib/auth/passwordRules'

export function RegisterForm() {
  // State form — chỉ quản lý giá trị input
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /** Lỗi validate client-side (độ dài mật khẩu, xác nhận không khớp) — cùng pattern với SecurityPage */
  const [clientFieldErrors, setClientFieldErrors] = useState<Record<string, string>>({})

  // Hook xử lý toàn bộ logic đăng ký
  const {
    register,
    isLoading,
    error,
    fieldErrors,
    isSuccess,
    successMessage,
    clearErrors,
  } = useRegister()

  // Hook xử lý đăng nhập bằng Google (đăng ký + đăng nhập cùng lúc)
  const { googleLogin, isLoading: isGoogleLoading, error: googleError } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClientFieldErrors({})

    const pwdErr = validateNewAccountPassword(password)
    if (pwdErr) {
      setClientFieldErrors({ password: pwdErr })
      return
    }
    if (password !== confirmPassword) {
      setClientFieldErrors({ confirmPassword: PASSWORD_CONFIRM_MISMATCH_MESSAGE })
      return
    }

    // Chỉ gửi 4 field mà backend chấp nhận
    const registerData: RegisterRequest = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    }

    await register(registerData)
  }

  // Nếu đăng ký thành công → hiện thông báo thay vì form
  if (isSuccess) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="text-green-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-900">Đăng Ký Thành Công!</h2>
          <p className="text-gray-600">
            {successMessage || 'Tài khoản đã tạo. Vui lòng kiểm tra email xác thực.'}
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-lg bg-[#1A3C6E] px-6 py-2 text-white hover:bg-[#1A3C6E]/90 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Tạo Tài Khoản Mới</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Họ và tên */}
        <Input
          id="register-name"
          label="Họ và tên"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            clearErrors()
          }}
          placeholder="Nguyễn Văn A"
          error={fieldErrors['name']}
          required
          autoComplete="name"
        />

        {/* Email */}
        <Input
          id="register-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearErrors()
          }}
          placeholder="email@example.com"
          error={fieldErrors['email']}
          required
          autoComplete="email"
        />

        {/* Số điện thoại */}
        <Input
          id="register-phone"
          label="Số điện thoại"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            clearErrors()
          }}
          placeholder="0905123456"
          error={fieldErrors['phone']}
          required
          autoComplete="tel"
        />

        {/* Mật khẩu + strength indicator */}
        <div>
          <div className="relative">
            <Input
              id="register-password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setClientFieldErrors({})
            clearErrors()
          }}
          placeholder={ACCOUNT_PASSWORD_PLACEHOLDER}
          error={fieldErrors['password'] || clientFieldErrors['password']}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="relative">
          <Input
            id="register-confirm-password"
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setClientFieldErrors({})
            }}
            placeholder="Nhập lại mật khẩu"
            error={clientFieldErrors['confirmPassword']}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Hiển thị lỗi chung từ API */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Nút đăng ký */}
        <Button
          id="register-submit"
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading || !name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Đang đăng ký...
            </span>
          ) : (
            'Tạo Tài Khoản'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-500">hoặc</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Đăng ký bằng Google — backend tự tạo account nếu chưa có */}
      <GoogleLoginButton isLoading={isLoading || isGoogleLoading} onGoogleLogin={googleLogin} />
      {googleError && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{googleError}</p>
        </div>
      )}

      {/* Link đăng nhập */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#E8612A] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
