import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import authService from '@/services/auth.service'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)

  // Nếu URL không có token → hiển thị thông báo lỗi
  if (!token) {
    return (
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm md:p-8">
        <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Link không hợp lệ</h1>
        <p className="mt-2 text-gray-500">
          Link đặt lại mật khẩu không hợp lệ hoặc đã bị thiếu thông tin.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block">
          <Button variant="primary">Gửi lại email đặt lại mật khẩu</Button>
        </Link>
      </div>
    )
  }

  // Thành công → hiển thị thông báo rồi redirect
  if (success) {
    return (
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm md:p-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Đặt lại mật khẩu thành công!</h1>
        <p className="mt-2 text-gray-500">
          Mật khẩu đã được cập nhật. Bạn sẽ được chuyển về trang đăng nhập...
        </p>
        <Link to="/login" className="mt-6 inline-block">
          <Button variant="primary">Đăng nhập ngay</Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationError('')

    // Validate 2 ô mật khẩu phải khớp
    if (password !== confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp.')
      return
    }

    if (password.length < 8) {
      setValidationError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Đặt Lại Mật Khẩu</h1>
      <p className="mt-2 text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{error}</p>
          <Link to="/forgot-password" className="mt-1 inline-block text-[#E8612A] hover:underline">
            Gửi lại email đặt lại mật khẩu
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setValidationError('') }}
          required
        />
        <div>
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setValidationError('') }}
            required
          />
          {validationError && (
            <p className="mt-1 text-sm text-red-600">{validationError}</p>
          )}
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Cập Nhật Mật Khẩu'}
        </Button>
      </form>
    </div>
  )
}
