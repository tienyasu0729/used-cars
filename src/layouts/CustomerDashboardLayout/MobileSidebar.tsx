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
import { useNotificationUnreadCount } from '@/hooks/useNotificationUnreadCount'
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

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user, logout } = useAuthStore()
  const { data: notificationUnread = 0 } = useNotificationUnreadCount()
  const { data: bookings } = useBookings()
  const { data: depData } = useDeposits({ size: 200 })
  const deposits = depData?.deposits ?? []
  const { data: conversations } = useConversations()

  const bookingPending = bookings?.filter((b) => b.status === 'Pending').length ?? 0
  const depositActive =
    deposits.filter((d) => ['Confirmed', 'Pending', 'RefundPending'].includes(d.status)).length ?? 0
  const chatUnread = conversations?.reduce((s, c) => s + (c.unreadCount ?? 0), 0) ?? 0

  const getBadge = (key: string) => {
    if (key === 'notifications') return notificationUnread
    if (key === 'bookings') return bookingPending
    if (key === 'deposits') return depositActive
    if (key === 'chat') return chatUnread
    return 0
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[280px] transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col gap-1 overflow-y-auto p-4">
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
                onClick={onClose}
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
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Đăng Xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
