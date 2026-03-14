import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/authApi'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }
    setLoading(true)
    try {
      const { user, token } = await authApi.login({ email, password })
      login(user, token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  // const handleDemoLogin = async () => {
  //   setError('')
  //   setLoading(true)
  //   try {
  //     const { user, token } = await authApi.login({
  //       email: 'customer@test.com',
  //       password: '123456',
  //     })
  //     login(user, token)
  //     navigate(from, { replace: true })
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Đăng Nhập</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email hoặc SĐT"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-[#E8612A] hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </Button>
        {/* <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          Đăng nhập demo
        </Button> */}
      </form>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-500">hoặc đăng nhập bằng</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>
      <Button variant="outline" className="mt-4 w-full" type="button">
        Google
      </Button>
      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#E8612A] hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
