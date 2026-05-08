import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { Button, Input } from '@/components/ui'
import { useLogin } from '@/hooks/useLogin'
import type { LoginRequest } from '@/types/auth.types'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { login, googleLogin, isLoading, error, fieldErrors, clearErrors } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) return

    const loginData: LoginRequest = {
      email: email.trim(),
      password,
    }

    await login(loginData)
  }

  return (
    <div className="w-full rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-8">
      <div>
        <span className="inline-flex rounded-full bg-[#E8612A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#E8612A]">
          Đăng nhập hệ thống
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Chào mừng quay lại</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Nhập email và mật khẩu để tiếp tục quá trình mua bán, theo dõi xe và quản lý giao dịch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearErrors()
          }}
          onInput={(e) => {
            setEmail(e.currentTarget.value)
            clearErrors()
          }}
          placeholder="email@example.com"
          error={fieldErrors.email}
          required
          autoComplete="email"
        />

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
            error={fieldErrors.password}
            required
            autoComplete="current-password"
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

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-[#E8612A] hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button id="login-submit" type="submit" variant="primary" className="h-11 w-full" disabled={isLoading}>
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

      <div className="mt-5 flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-500">hoặc</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <GoogleLoginButton isLoading={isLoading} onGoogleLogin={googleLogin} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-[#E8612A] hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
