import { Link } from 'react-router-dom'
import { Bell, ChevronDown, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/hooks/useNotifications'

interface CustomerTopbarProps {
  title: string
  onMenuClick?: () => void
}

export function CustomerTopbar({ title, onMenuClick }: CustomerTopbarProps) {
  const { user } = useAuthStore()
  const { data: notifications } = useNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 lg:hidden"
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
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard/notifications"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8612A] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-sm font-medium text-[#1A3C6E]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  )
}
