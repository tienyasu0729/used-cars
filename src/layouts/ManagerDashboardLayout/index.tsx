import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAccountStatusHeartbeat } from '@/hooks/useAccountStatusHeartbeat'
import { useInboxNotificationsWebSocket } from '@/hooks/useInboxNotificationsWebSocket'
import { ManagerSidebar } from './ManagerSidebar'
import { ManagerTopbar } from './ManagerTopbar'
import { ManagerMobileSidebar } from './MobileSidebar'

const pageTitles: Record<string, string> = {
  '/manager/dashboard': 'Tổng Quan Quản Lý',
  '/manager/vehicles': 'Quản Lý Xe',
  '/manager/vehicles/new': 'Thêm Xe Mới',
  '/manager/staff': 'Quản Lý Nhân Viên',
  '/manager/staff/new': 'Tạo Tài Khoản Nhân Viên',
  '/manager/appointments': 'Tổng Quan Lịch Hẹn',
  '/manager/transfers': 'Yêu Cầu Điều Chuyển',
  '/manager/reports': 'Báo Cáo Chi Nhánh',
  '/manager/notifications': 'Thông Báo',
  '/manager/settings': 'Cài Đặt Chi Nhánh',
  '/manager/profile': 'Hồ Sơ Cá Nhân',
  '/manager/security': 'Bảo Mật',
}

function getPageTitle(pathname: string): string {
  if (pathname.match(/\/manager\/vehicles\/[^/]+\/edit/)) return 'Chỉnh Sửa Xe'
  return pageTitles[pathname] ?? 'Quản Lý Chi Nhánh'
}

export function ManagerDashboardLayout() {
  useAccountStatusHeartbeat()
  useInboxNotificationsWebSocket()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <div className="flex min-h-screen overflow-hidden">
      <ManagerSidebar />
      <ManagerMobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-[220px]">
        <ManagerTopbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-[#F6F7F8] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
