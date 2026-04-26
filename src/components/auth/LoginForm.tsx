/**
 * LoginForm — Component form đăng nhập (email/password + Google)
 * 
 * Mapping: POST /auth/login, POST /auth/google
 * 
 * Component này CHỈ lo render UI:
 * - 2 field: Email, Password (có toggle hiện/ẩn)
 * - Nút submit với loading spinner
 * - Nút đăng nhập bằng Google (Google One Tap)
 * - Hiện lỗi chung + lỗi từng field
 * - Link quên mật khẩu + đăng ký
 * 
 * Logic xử lý nằm hoàn toàn trong useLogin hook.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useLogin } from '@/hooks/useLogin'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { Button, Input } from '@/components/ui'
import type { LoginRequest } from '@/types/auth.types'

export function LoginForm() {
  // State form — chỉ quản lý giá trị input, không chứa logic API
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Hook xử lý toàn bộ logic đăng nhập (email/password + Google)
  const { login, googleLogin, isLoading, error, fieldErrors, clearErrors } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate cơ bản trước khi gửi API (tránh request thừa)
    if (!email.trim() || !password.trim()) return

    const loginData: LoginRequest = {
      email: email.trim(),
      password,
    }

    await login(loginData)
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Đăng Nhập</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Email input */}
        <Input
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearErrors() // Xóa lỗi khi user bắt đầu nhập lại
          }}
          // Autofill trình duyệt đôi khi không kích hoạt onChange đúng lúc → state vẫn rỗng, nút submit vẫn disabled.
          onInput={(e) => {
            setEmail(e.currentTarget.value)
            clearErrors()
          }}
          placeholder="email@example.com"
          error={fieldErrors['email']}
          required
          autoComplete="email"
        />

        {/* Password input với toggle hiện/ẩn */}
        <div className="relative">
          <Input
            id="login-password"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearErrors()
            }}
            onInput={(e) => {
              setPassword(e.currentTarget.value)
              clearErrors()
            }}
            placeholder="Nhập mật khẩu"
            error={fieldErrors['password']}
            required
            autoComplete="current-password"
          />
          {/* Nút toggle hiện/ẩn mật khẩu */}
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

        {/* Link quên mật khẩu */}
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[#E8612A] hover:underline"
          >
            Quên mật khẩu?
            {/* TODO: implement khi backend xong — hiện tại link tới placeholder page */}
          </Link>
        </div>

        {/* Hiển thị lỗi chung (sai password, account bị khóa, v.v.) */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Nút đăng nhập — chỉ disabled khi đang gọi API; rỗng thì browser + handleSubmit xử lý */}
        <Button
          id="login-submit"
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Đang đăng nhập...
            </span>
          ) : (
            'Đăng Nhập'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-500">hoặc</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Đăng nhập bằng Google — gửi ID Token lên backend POST /auth/google */}
      <GoogleLoginButton isLoading={isLoading} onGoogleLogin={googleLogin} />

      {/* Link đăng ký */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#E8612A] hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
