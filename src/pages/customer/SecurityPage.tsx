import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, ShieldCheck, Monitor, ChevronRight } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import authService from '@/services/auth.service'
import { useToastStore } from '@/store/toastStore'
import type { ApiErrorResponse } from '@/types/auth.types'
import {
  ACCOUNT_PASSWORD_PLACEHOLDER,
  PASSWORD_CONFIRM_MISMATCH_MESSAGE,
  validateNewAccountPassword,
} from '@/lib/auth/passwordRules'

export function SecurityPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const clearFieldErrors = () => setFieldErrors({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearFieldErrors()

    const next: Record<string, string> = {}
    if (!currentPassword.trim()) {
      next.currentPassword = 'Mật khẩu hiện tại không được để trống.'
    }
    const newPwdErr = validateNewAccountPassword(newPassword)
    if (newPwdErr) next.newPassword = newPwdErr
    if (!confirmPassword.trim()) {
      next.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.'
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = PASSWORD_CONFIRM_MISMATCH_MESSAGE
    }

    if (Object.keys(next).length > 0) {
      setFieldErrors(next)
      return
    }

    setSubmitting(true)
    try {
      const { message } = await authService.changePassword({
        currentPassword,
        newPassword,
      })
      addToast('success', message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const api = err as ApiErrorResponse
      if (api.errorCode === 'INVALID_CURRENT_PASSWORD') {
        setFieldErrors({ currentPassword: api.message || 'Mật khẩu hiện tại không đúng.' })
        return
      }
      if (api.errorCode === 'PASSWORD_TOO_SHORT') {
        setFieldErrors({ newPassword: api.message || 'Mật khẩu từ 8 đến 100 ký tự.' })
        return
      }
      if (api.errorCode === 'VALIDATION_FAILED') {
        if (api.errors?.length) {
          const fe: Record<string, string> = {}
          for (const x of api.errors) fe[x.field] = x.message
          setFieldErrors(fe)
          return
        }
        if (api.message) {
          setFieldErrors({ newPassword: api.message })
          return
        }
      }
      addToast(
        'error',
        api?.errors?.length ? api.errors.map((x) => x.message).join(' ') : api?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/dashboard" className="text-slate-500 hover:text-[#1A3C6E]">Bảng điều khiển</Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">Bảo mật</span>
        </nav>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900">Bảo mật tài khoản</h1>
          <p className="text-slate-500">Quản lý mật khẩu, phiên đăng nhập và các lớp bảo mật bổ sung.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <Lock className="h-5 w-5 text-[#1A3C6E]" />
          <h2 className="text-lg font-bold">Đổi mật khẩu</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative md:col-span-2">
              <Input
                id="security-current-password"
                label="Mật khẩu hiện tại"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  clearFieldErrors()
                }}
                placeholder="••••••••"
                error={fieldErrors.currentPassword}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  id="security-new-password"
                  label="Mật khẩu mới"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    clearFieldErrors()
                  }}
                  placeholder={ACCOUNT_PASSWORD_PLACEHOLDER}
                  error={fieldErrors.newPassword}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>
            <div className="relative md:col-span-2">
              <Input
                id="security-confirm-password"
                label="Xác nhận mật khẩu mới"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  clearFieldErrors()
                }}
                placeholder="Nhập lại mật khẩu"
                error={fieldErrors.confirmPassword}
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
            <div className="flex justify-end md:col-span-2">
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={
                  submitting ||
                  !currentPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
                className="px-6 py-2.5 font-bold shadow-lg shadow-[#1A3C6E]/20"
              >
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10">
            <ShieldCheck className="h-6 w-6 text-[#1A3C6E]" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Xác thực 2 yếu tố (2FA)</h3>
            <p className="mt-1 text-sm text-slate-500">
              Thêm một lớp bảo mật cho tài khoản của bạn bằng cách yêu cầu mã từ điện thoại của bạn khi đăng nhập.
            </p>
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <div className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#1A3C6E] peer-checked:after:translate-x-full" />
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-[#1A3C6E]" />
            <h3 className="text-lg font-bold">Phiên đăng nhập hiện tại</h3>
          </div>
          <button className="text-sm font-medium text-red-500 hover:underline">
            Đăng xuất khỏi tất cả thiết bị
          </button>
        </div>
        <div className="divide-y divide-slate-100 px-6 py-10 text-center text-sm text-slate-500">
          <Monitor className="mx-auto mb-3 h-10 w-10 text-slate-400" aria-hidden />
          <p className="font-medium text-slate-700">Chưa có danh sách phiên từ API</p>
          <p className="mt-2">Kết nối endpoint phiên đăng nhập khi backend hỗ trợ.</p>
        </div>
      </section>
    </div>
  )
}
