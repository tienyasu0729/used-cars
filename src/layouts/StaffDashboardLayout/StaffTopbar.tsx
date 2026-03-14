import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, Menu, Settings, LogOut, Key, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useStaffNotifications } from '@/hooks/useStaffNotifications'

interface StaffTopbarProps {
  title: string
  onMenuClick?: () => void
}

export function StaffTopbar({ title, onMenuClick }: StaffTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const { data: notifications } = useStaffNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

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
          to="/"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Trở về trang chủ</span>
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
        <div className="relative flex cursor-pointer items-center gap-2 group" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-white/10"
          >
            <Settings className="h-5 w-5 text-white group-hover:text-[#E8612A]" />
            <span className="hidden text-sm font-medium sm:block">Cài đặt</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800 py-2 shadow-xl">
              <div className="border-b border-slate-700 px-4 py-2">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">Nhân viên Kinh doanh</p>
              </div>
              <Link
                to="/staff/security"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Key className="h-4 w-4" />
                Đổi Mật Khẩu
              </Link>
              <button
                onClick={() => {
                  logout()
                  setDropdownOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Đăng Xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
