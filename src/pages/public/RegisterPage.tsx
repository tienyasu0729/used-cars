import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return
    window.location.href = '/login'
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Tạo Tài Khoản Mới</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Họ và tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Số điện thoại"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => setForm({ ...form, agree: e.target.checked })}
            className="mt-1 rounded"
          />
          <span className="text-sm">Tôi đồng ý với Điều Khoản Dịch Vụ</span>
        </label>
        <Button type="submit" variant="primary" className="w-full">
          Tạo Tài Khoản
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#E8612A] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
