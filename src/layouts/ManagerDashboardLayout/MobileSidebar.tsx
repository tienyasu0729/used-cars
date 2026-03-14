import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Car, Users, Calendar, ArrowLeftRight, BarChart3, Bell, Settings, User, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useManagerNotifications } from '@/hooks/useManagerNotifications'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
  { to: '/manager/vehicles', icon: Car, label: 'Quản Lý Xe' },
  { to: '/manager/staff', icon: Users, label: 'Quản Lý Nhân Viên' },
  { to: '/manager/appointments', icon: Calendar, label: 'Lịch Hẹn' },
  { to: '/manager/transfers', icon: ArrowLeftRight, label: 'Yêu Cầu Điều Chuyển' },
  { to: '/manager/reports', icon: BarChart3, label: 'Báo Cáo' },
  { to: '/manager/notifications', icon: Bell, label: 'Thông Báo', badgeKey: 'notifications' },
  { to: '/manager/settings', icon: Settings, label: 'Cài Đặt Chi Nhánh' },
  { to: '/manager/security', icon: Lock, label: 'Bảo Mật' },
]

export function ManagerMobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user } = useAuthStore()
  const { data: notifications } = useManagerNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

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
          {navItems.map((item) => {
            const badge = item.badgeKey === 'notifications' ? unreadCount : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/manager/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
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
