import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/login'
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Đặt Lại Mật Khẩu</h1>
      <p className="mt-2 text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full">
          Cập Nhật Mật Khẩu
        </Button>
      </form>
    </div>
  )
}
