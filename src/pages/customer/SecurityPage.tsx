import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ShieldCheck, Monitor, Smartphone, Tablet, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui'

const mockSessions = [
  { id: '1', device: 'Chrome trên macOS', icon: Monitor, location: 'Đà Nẵng, Việt Nam • IP: 115.79.136.21', time: 'Đang hoạt động', isCurrent: true },
  { id: '2', device: 'iPhone 13 Pro', icon: Smartphone, location: 'TP. Hồ Chí Minh, Việt Nam • 2 giờ trước', time: '', isCurrent: false },
  { id: '3', device: 'Samsung Galaxy Tab S8', icon: Tablet, location: 'Đà Nẵng, Việt Nam • 1 ngày trước', time: '', isCurrent: false },
]

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <div className="flex justify-end md:col-span-2">
              <Button type="submit" variant="primary" className="px-6 py-2.5 font-bold shadow-lg shadow-[#1A3C6E]/20">
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
        <div className="divide-y divide-slate-100">
          {mockSessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <s.icon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {s.device}
                    {s.isCurrent && (
                      <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                        Thiết bị này
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{s.location}</p>
                </div>
              </div>
              {s.isCurrent ? (
                <span className="text-xs text-slate-400">Đang hoạt động</span>
              ) : (
                <button className="text-slate-400 transition-colors hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
