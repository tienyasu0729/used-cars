import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, Menu, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getRoleLabel } from '@/utils/roleLabels'

interface AdminTopbarProps {
  title: string
  onMenuClick?: () => void
}

export function AdminTopbar({ title, onMenuClick }: AdminTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()

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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#1A3C6E]/30 bg-[#1A3C6E] px-6 md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="hidden text-sm text-white/70 hover:text-white sm:block">
          ← Về trang chủ
        </Link>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/admin/notifications"
          className="relative rounded-full p-2 text-white/80 transition-colors hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
        </Link>
        <div className="mx-2 h-8 w-px bg-white/20" />
        <div className="relative flex cursor-pointer items-center gap-3" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/70">{getRoleLabel(user?.role)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/20">
              <span className="text-sm font-medium text-white">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-white/70" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
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
