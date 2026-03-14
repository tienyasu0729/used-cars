import { NavLink } from 'react-router-dom'
import { getRoleLabel } from '@/utils/roleLabels'
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  BookOpen,
  ArrowLeftRight,
  FileText,
  Settings,
  BarChart3,
  ScrollText,
  Bell,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTransfersAdmin } from '@/hooks/useTransfersAdmin'
import { BrandLogo } from '@/components/common/BrandLogo'

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

export function AdminSidebar() {
  const { user } = useAuthStore()
  const { data: transfers } = useTransfersAdmin()
  const pendingCount = transfers?.filter((t: { status: string }) => t.status === 'pending').length ?? 0

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-shrink-0 flex-col bg-gray-900 lg:flex">
      <div className="flex flex-col border-b border-gray-700 p-6">
        <BrandLogo variant="dark" linkTo="/" logoHeight={28} className="shrink-0" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const badge = item.badgeKey === 'transfers' ? pendingCount : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'border-l-4 border-[#1A3C6E] bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs font-medium text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="space-y-2 border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-gray-600 bg-gray-700">
            <span className="text-sm font-medium text-white">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
            <p className="truncate text-xs text-gray-400">{getRoleLabel(user?.role)}</p>
          </div>
        </div>
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <User className="h-4 w-4" />
          Hồ sơ cá nhân
        </NavLink>
      </div>
    </aside>
  )
}
