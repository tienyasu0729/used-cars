import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  MessageSquare,
  Package,
  PlusCircle,
  ClipboardList,
  Banknote,
  MessageCircle,
  ArrowLeftRight,
  User,
  Bell,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStaffNotifications } from '@/hooks/useStaffNotifications'
import { BrandLogo } from '@/components/common/BrandLogo'

const navItems = [
  { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
  { to: '/staff/schedule', icon: Calendar, label: 'Lịch Làm Việc' },
  { to: '/staff/bookings', icon: CalendarCheck, label: 'Lịch Lái Thử', badgeKey: 'bookings' },
  { to: '/staff/consultations', icon: MessageSquare, label: 'Yêu Cầu Tư Vấn', badgeKey: 'consultations' },
  { to: '/staff/inventory', icon: Package, label: 'Tồn Kho' },
  { to: '/staff/orders/new', icon: PlusCircle, label: 'Tạo Đơn Mua' },
  { to: '/staff/orders', icon: ClipboardList, label: 'Danh Sách Đơn' },
  { to: '/staff/deposits/new', icon: Banknote, label: 'Tạo Đặt Cọc' },
  { to: '/staff/chat', icon: MessageCircle, label: 'Chat Khách Hàng', badgeKey: 'chat' },
  { to: '/staff/transfer-requests', icon: ArrowLeftRight, label: 'Yêu Cầu Điều Chuyển' },
  { to: '/staff/notifications', icon: Bell, label: 'Thông Báo', badgeKey: 'notifications' },
]

export function StaffSidebar() {
  const { user } = useAuthStore()
  const { data: notifications } = useStaffNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-slate-900 lg:flex">
      <div className="flex flex-col border-b border-slate-800 p-6">
        <BrandLogo variant="dark" linkTo="/" logoHeight={28} className="shrink-0" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const badge = item.badgeKey === 'notifications' ? unreadCount : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/staff/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'border-l-4 border-[#E8612A] bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs font-medium text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="space-y-2 border-t border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#1A3C6E] bg-slate-700">
            <span className="text-sm font-medium text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'Nhân viên'}</p>
            <p className="truncate text-xs text-slate-500">Nhân viên Kinh doanh</p>
          </div>
        </div>
        <NavLink
          to="/staff/profile"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <User className="h-4 w-4" />
          Hồ Sơ Cá Nhân
        </NavLink>
      </div>
    </aside>
  )
}
