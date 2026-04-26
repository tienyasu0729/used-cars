import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Car, Users, Calendar, ArrowLeftRight, BarChart3, Bell, Settings, PlusCircle, ClipboardList, Banknote, ListChecks, User, Lock, CreditCard, MessageSquare, FileText, Newspaper } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useHasPermission } from '@/hooks/usePermissions'
import { useNotificationUnreadCount } from '@/hooks/useNotificationUnreadCount'
import { useInternalStaffChatUnreadCount } from '@/hooks/useChats'
import { useStaffDashboardStats } from '@/hooks/useStaffDashboardStats'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type BadgeKey = 'chat' | 'notifications' | 'appointments' | 'orders' | 'consultations'

const navItems: Array<{
  to: string
  icon: typeof LayoutDashboard
  label: string
  badgeKey?: BadgeKey
  requiresCms?: boolean
}> = [
  { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
  { to: '/manager/vehicles', icon: Car, label: 'Quản Lý Xe' },
  { to: '/manager/staff', icon: Users, label: 'Quản Lý Nhân Viên' },
  { to: '/manager/appointments', icon: Calendar, label: 'Lịch Hẹn', badgeKey: 'appointments' },
  { to: '/manager/orders/new', icon: PlusCircle, label: 'Tạo Đơn Mua' },
  { to: '/manager/orders', icon: ClipboardList, label: 'Đơn Hàng', badgeKey: 'orders' },
  { to: '/manager/deposits/new', icon: Banknote, label: 'Tạo Đặt Cọc' },
  { to: '/manager/deposits', icon: ListChecks, label: 'Danh Sách Cọc' },
  { to: '/manager/consultations', icon: FileText, label: 'Yêu Cầu Tư Vấn', badgeKey: 'consultations' },
  { to: '/manager/articles', icon: Newspaper, label: 'Bài viết', requiresCms: true },
  { to: '/manager/chat', icon: MessageSquare, label: 'Chat Khách Hàng', badgeKey: 'chat' },
  { to: '/manager/installments', icon: FileText, label: 'Hồ Sơ Trả Góp' },
  { to: '/manager/transfers', icon: ArrowLeftRight, label: 'Yêu Cầu Điều Chuyển' },
  { to: '/manager/reports', icon: BarChart3, label: 'Báo Cáo' },
  { to: '/manager/transactions', icon: CreditCard, label: 'Lịch sử giao dịch' },
  { to: '/manager/notifications', icon: Bell, label: 'Thông Báo', badgeKey: 'notifications' },
  { to: '/manager/settings', icon: Settings, label: 'Cài Đặt Chi Nhánh' },
  { to: '/manager/security', icon: Lock, label: 'Bảo Mật' },
]

export function ManagerMobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user } = useAuthStore()
  const canManageCms = useHasPermission('CMS', 'manage')
  const { data: unreadCount = 0 } = useNotificationUnreadCount()
  const chatUnread = useInternalStaffChatUnreadCount()
  const { data: dashStats } = useStaffDashboardStats()

  const badgeCounts: Record<BadgeKey, number> = {
    notifications: unreadCount,
    chat: chatUnread,
    appointments: dashStats?.pendingBookings ?? 0,
    orders: dashStats?.pendingOrders ?? 0,
    consultations: dashStats?.pendingConsultations ?? 0,
  }

  const visibleNav = navItems.filter((item) => !item.requiresCms || canManageCms)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#1A3C6E] lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <span className="text-lg font-bold text-white">Menu</span>
          <button onClick={onClose} className="rounded-lg p-2 text-white hover:bg-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto p-4">
          {visibleNav.map((item) => {
            const badge = item.badgeKey ? badgeCounts[item.badgeKey] : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={
                  item.to === '/manager/dashboard' ||
                  item.to === '/manager/orders' ||
                  item.to === '/manager/deposits'
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'
                  }`
                }
              >
                <span className="relative shrink-0">
                  <item.icon className="h-5 w-5" />
                  {item.badgeKey === 'chat' && chatUnread > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1A3C6E]"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="flex-1">{item.label}</span>
                {badge > 0 && item.badgeKey !== 'chat' && (
                  <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs font-medium text-white">
                    {badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 space-y-2 border-t border-white/10 bg-black/10 p-4">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-white/70">Trưởng Chi Nhánh</p>
          </div>
          <NavLink
            to="/manager/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <User className="h-4 w-4" />
            Hồ Sơ Cá Nhân
          </NavLink>
        </div>
      </aside>
    </>
  )
}
