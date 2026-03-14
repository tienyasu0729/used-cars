import { useState } from 'react'
import { Button } from '@/components/ui'

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảo Mật</h1>
        <p className="mt-1 text-slate-500">Đổi mật khẩu và quản lý phiên đăng nhập</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Đổi Mật Khẩu</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]/20"
          />
        </div>
        <Button type="submit">Đổi Mật Khẩu</Button>
      </form>
    </div>
  )
}
