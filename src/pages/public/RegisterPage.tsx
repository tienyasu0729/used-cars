import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { PasswordStrength } from '@/components/auth/PasswordStrength'

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    address: '',
    agree: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return
    if (!form.agree) return
    window.location.href = '/login'
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
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
        <div>
          <Input
            label="Mật khẩu"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <PasswordStrength password={form.password} />
        </div>
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
        <Input
          label="Ngày sinh"
          type="date"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          required
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Giới tính <span className="text-red-500">*</span>
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
            required
          >
            <option value="">-- Chọn --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <Input
          label="Địa chỉ"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => setForm({ ...form, agree: e.target.checked })}
            className="mt-1 rounded"
          />
          <span className="text-sm">Tôi đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật</span>
        </label>
        <Button type="submit" variant="primary" className="w-full">
          Tạo Tài Khoản
        </Button>
      </form>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-500">hoặc</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>
      <Button variant="outline" className="mt-4 w-full" type="button">
        Tiếp tục với Google
      </Button>
      <p className="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#E8612A] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
