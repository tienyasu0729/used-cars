import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Shield,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  Bell,
  Lock,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/hooks/useNotifications'
import { useBookings } from '@/hooks/useBookings'
import { useDeposits } from '@/hooks/useDeposits'
import { useConversations } from '@/hooks/useChats'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
  { to: '/dashboard/saved', icon: Heart, label: 'Xe Đã Lưu' },
  { to: '/dashboard/bookings', icon: Calendar, label: 'Lịch Lái Thử', badgeKey: 'bookings' },
  { to: '/dashboard/deposits', icon: Shield, label: 'Đặt Cọc', badgeKey: 'deposits' },
  { to: '/dashboard/orders', icon: ShoppingBag, label: 'Đơn Mua' },
  { to: '/dashboard/transactions', icon: CreditCard, label: 'Giao Dịch' },
  { to: '/dashboard/chat', icon: MessageCircle, label: 'Chat', badgeKey: 'chat' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Thông Báo', badgeKey: 'notifications' },
  { to: '/dashboard/security', icon: Lock, label: 'Bảo Mật' },
]

export function CustomerSidebar() {
  const { user, logout } = useAuthStore()
  const { data: notifications } = useNotifications()
  const { data: bookings } = useBookings()
  const { data: deposits } = useDeposits()
  const { data: conversations } = useConversations()

  const notificationUnread = notifications?.filter((n) => !n.read).length ?? 0
  const bookingPending = bookings?.filter((b) => b.status === 'Pending').length ?? 0
  const depositActive = deposits?.filter((d) => d.status === 'Confirmed').length ?? 0
  const chatUnread = conversations?.reduce((s, c) => s + (c.unreadCount ?? 0), 0) ?? 0

  const getBadge = (key: string) => {
    if (key === 'notifications') return notificationUnread
    if (key === 'bookings') return bookingPending
    if (key === 'deposits') return depositActive
    if (key === 'chat') return chatUnread
    return 0
  }

  return (
    <aside className="hidden w-[220px] flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex flex-col gap-1 p-4">
        <div className="mb-4 flex items-center gap-3 px-3 py-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1A3C6E]/10">
            <span className="text-2xl font-bold text-[#1A3C6E]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{user?.name || 'Khách'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
          </div>
        </div>
        {navItems.map((item) => {
          const badge = getBadge(item.badgeKey || '')
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-medium text-[#1A3C6E]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs font-medium text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Đăng Xuất
          </button>
        </div>
      </div>
    </aside>
  )
}
