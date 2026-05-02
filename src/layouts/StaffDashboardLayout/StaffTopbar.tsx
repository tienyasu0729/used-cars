import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Home, Key, LogOut, Menu, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotificationUnreadCount } from '@/hooks/useNotificationUnreadCount'

interface StaffTopbarProps {
  title: string
  onMenuClick?: () => void
}

export function StaffTopbar({ title, onMenuClick }: StaffTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const { data: unreadCount = 0 } = useNotificationUnreadCount()
  const { pathname } = useLocation()

  const isEditVehiclePage = /\/staff\/vehicles\/[^/]+\/edit$/.test(pathname)
  const topLinkTo = isEditVehiclePage ? '/staff/inventory' : '/'
  const topLinkLabel = isEditVehiclePage ? 'Quay lại danh sách xe' : 'Trở về trang chủ'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between bg-[#1A3C6E] px-6 text-white">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link
          to={topLinkTo}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">{topLinkLabel}</span>
        </Link>
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="hidden text-white/50 sm:inline">|</span>
        <p className="hidden text-sm text-white sm:block">{dateStr}</p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/staff/notifications"
          className="relative rounded-lg p-2 text-white transition-colors hover:text-[#E8612A]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#1A3C6E] bg-[#E8612A] text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="group relative flex cursor-pointer items-center gap-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-white/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <span className="hidden text-sm font-medium sm:block">{user?.name || 'Nhân viên'}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-800 py-2 shadow-2xl">
              <div className="border-b border-slate-700 px-4 py-3">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">Nhân viên Kinh doanh</p>
              </div>
              <Link
                to="/staff/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <User className="h-4 w-4" />
                Hồ sơ
              </Link>
              <Link
                to="/staff/notifications"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Bell className="h-4 w-4" />
                Thông báo
              </Link>
              <Link
                to="/staff/security"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Key className="h-4 w-4" />
                Đổi mật khẩu
              </Link>
              <Link
                to="/"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Home className="h-4 w-4" />
                Về trang chủ
              </Link>
              <button
                onClick={() => {
                  logout()
                  setDropdownOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
