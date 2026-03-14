import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Users, Shield, Building2, BookOpen, ArrowLeftRight, FileText, Settings, BarChart3, ScrollText, Bell, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getRoleLabel } from '@/utils/roleLabels'
import { useTransfersAdmin } from '@/hooks/useTransfersAdmin'

interface AdminMobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/roles', icon: Shield, label: 'Vai trò & Quyền' },
  { to: '/admin/branches', icon: Building2, label: 'Chi nhánh' },
  { to: '/admin/catalog', icon: BookOpen, label: 'Danh mục xe' },
  { to: '/admin/transfers', icon: ArrowLeftRight, label: 'Điều chuyển', badgeKey: 'transfers' },
  { to: '/admin/cms', icon: FileText, label: 'Quản lý nội dung' },
  { to: '/admin/config', icon: Settings, label: 'Cấu hình hệ thống' },
  { to: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
  { to: '/admin/logs', icon: ScrollText, label: 'Nhật ký hoạt động' },
  { to: '/admin/notifications', icon: Bell, label: 'Thông báo' },
]

export function AdminMobileSidebar({ isOpen, onClose }: AdminMobileSidebarProps) {
  const { user } = useAuthStore()
  const { data: transfers } = useTransfersAdmin()
  const pendingCount = transfers?.filter((t: { status: string }) => t.status === 'pending').length ?? 0

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
          <span className="text-lg font-bold text-white">Danh mục</span>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-300 hover:bg-gray-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const badge = item.badgeKey === 'transfers' ? pendingCount : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
        <div className="absolute bottom-0 left-0 right-0 space-y-2 border-t border-gray-700 bg-gray-800 p-4">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{getRoleLabel(user?.role)}</p>
          </div>
          <NavLink
            to="/admin/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <User className="h-4 w-4" />
            Hồ sơ cá nhân
          </NavLink>
        </div>
      </aside>
    </>
  )
}
