import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Calendar, CalendarCheck, MessageSquare, Package, PlusCircle, ClipboardList, Banknote, ListChecks, MessageCircle, ArrowLeftRight, User, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useInternalStaffChatUnreadCount } from '@/hooks/useChats'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
  { to: '/staff/schedule', icon: Calendar, label: 'Lịch Làm Việc' },
  { to: '/staff/bookings', icon: CalendarCheck, label: 'Lịch Lái Thử' },
  { to: '/staff/consultations', icon: MessageSquare, label: 'Yêu Cầu Tư Vấn' },
  { to: '/staff/inventory', icon: Package, label: 'Tồn Kho' },
  { to: '/staff/orders/new', icon: PlusCircle, label: 'Tạo Đơn Mua' },
  { to: '/staff/orders', icon: ClipboardList, label: 'Danh Sách Đơn' },
  { to: '/staff/deposits/new', icon: Banknote, label: 'Tạo Đặt Cọc' },
  { to: '/staff/deposits', icon: ListChecks, label: 'Danh Sách Cọc' },
  { to: '/staff/chat', icon: MessageCircle, label: 'Chat Khách Hàng', badgeKey: 'chat' as const },
  { to: '/staff/transfer-requests', icon: ArrowLeftRight, label: 'Yêu Cầu Điều Chuyển' },
  { to: '/staff/notifications', icon: Bell, label: 'Thông Báo' },
]

export function StaffMobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user } = useAuthStore()
  const chatUnread = useInternalStaffChatUnreadCount()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <span className="text-lg font-bold text-white">Menu</span>
          <button onClick={onClose} className="rounded-lg p-2 text-white hover:bg-slate-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={
                item.to === '/staff/dashboard' ||
                item.to === '/staff/orders' ||
                item.to === '/staff/deposits'
              }
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`
              }
            >
              <span className="relative shrink-0">
                <item.icon className="h-5 w-5" />
                {item.badgeKey === 'chat' && chatUnread > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900"
                    aria-hidden
                  />
                )}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 space-y-2 border-t border-slate-800 bg-slate-950/50 p-4">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">Nhân viên Kinh doanh</p>
          </div>
          <NavLink
            to="/staff/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
