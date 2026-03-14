import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, Menu, Settings, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useManagerNotifications } from '@/hooks/useManagerNotifications'

interface ManagerTopbarProps {
  title: string
  onMenuClick?: () => void
}

export function ManagerTopbar({ title, onMenuClick }: ManagerTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const { data: notifications } = useManagerNotifications()
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

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link
          to="/"
          className="hidden text-sm text-slate-500 hover:text-[#1A3C6E] sm:block"
        >
          ← Về trang chủ
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/manager/notifications"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8612A] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link
          to="/manager/settings"
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <div className="mx-2 h-8 w-px bg-slate-200" />
        <div className="relative flex cursor-pointer items-center gap-3" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{user?.name || 'Quản trị'}</p>
              <p className="text-xs text-slate-500">Trưởng Chi Nhánh</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 bg-slate-200">
              <span className="text-sm font-medium text-slate-600">{user?.name?.[0]?.toUpperCase() || 'M'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Trưởng Chi Nhánh</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  setDropdownOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-slate-50"
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
