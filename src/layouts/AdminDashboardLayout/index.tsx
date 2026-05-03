import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useInboxNotificationsWebSocket } from '@/hooks/useInboxNotificationsWebSocket'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { AdminMobileSidebar } from './AdminMobileSidebar'

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Tổng Quan Hệ Thống',
  '/admin/profile': 'Hồ Sơ Cá Nhân',
  '/admin/users': 'Quản Lý Người Dùng',
  '/admin/roles': 'Vai Trò & Quyền',
  '/admin/branches': 'Quản Lý Chi Nhánh',
  '/admin/branches/new': 'Thêm Chi Nhánh',
  '/admin/vehicles': 'Quản Lý Xe',
  '/admin/vehicles/new': 'Thêm Xe Mới',
  '/admin/catalog': 'Danh Mục Xe',
  '/admin/transfers': 'Duyệt Điều Chuyển',
  '/admin/home-banners': 'Banner Trang Chủ',
  '/admin/config': 'Cấu Hình Hệ Thống',
  '/admin/reports': 'Báo Cáo Tổng',
  '/admin/transactions': 'Lịch Sử Giao Dịch',
  '/admin/logs': 'Nhật Ký Hoạt Động',
  '/admin/notifications': 'Thông Báo',
  '/admin/security': 'Bảo Mật',
}

function getPageTitle(pathname: string): string {
  if (/^\/admin\/vehicles\/\d+\/edit$/.test(pathname)) return 'Chỉnh Sửa Xe'
  return pageTitles[pathname] ?? 'Admin Dashboard'
}

export function AdminDashboardLayout() {
  useInboxNotificationsWebSocket()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <div className="flex min-h-screen overflow-hidden">
      <AdminSidebar />
      <AdminMobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-[220px]">
        <AdminTopbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-auto overflow-y-auto bg-[#f6f7f8] p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
