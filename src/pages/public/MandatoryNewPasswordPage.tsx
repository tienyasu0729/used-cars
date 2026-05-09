/**
 * Bắt buộc đặt mật khẩu mới sau khi đăng nhập bằng mật khẩu tạm (admin reset).
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { getRedirectPathByRole } from '@/hooks/useLogin'
import { Button, Input } from '@/components/ui'

export function MandatoryNewPasswordPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, setAuth } = useAuthStore()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.passwordChangeRequired !== true) {
      navigate(getRedirectPathByRole(user.role), { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8 || newPassword.length > 100) {
      setError('Mật khẩu từ 8 đến 100 ký tự.')
      return
    }
    if (newPassword !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setLoading(true)
    try {
      const { user: nextUser, token } = await authService.completeRequiredPasswordChange({
        newPassword,
      })
      setAuth(nextUser, token)
      navigate(getRedirectPathByRole(nextUser.role), { replace: true })
    } catch (err: unknown) {
      const ax = err as { message?: string }
      setError(ax.message ?? 'Không đặt được mật khẩu mới.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user || user.passwordChangeRequired !== true) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-slate-500">
        Đang chuyển hướng…
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đặt mật khẩu mới</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tài khoản <span className="font-medium text-slate-800">{user.email}</span> đang dùng mật khẩu tạm. Vui lòng
          tạo mật khẩu mới để tiếp tục.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Mật khẩu mới</span>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
            minLength={8}
            maxLength={100}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Nhập lại mật khẩu</span>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            required
            minLength={8}
            maxLength={100}
          />
        </label>
        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Xác nhận và vào hệ thống
        </Button>
      </form>
    </div>
  )
}
