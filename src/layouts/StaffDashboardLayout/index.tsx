import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { StaffSidebar } from './StaffSidebar'
import { StaffTopbar } from './StaffTopbar'
import { StaffMobileSidebar } from './MobileSidebar'

const pageTitles: Record<string, string> = {
  '/staff/dashboard': 'Tổng Quan Dashboard',
  '/staff/schedule': 'Lịch Làm Việc',
  '/staff/bookings': 'Lịch Lái Thử',
  '/staff/consultations': 'Yêu Cầu Tư Vấn',
  '/staff/inventory': 'Tồn Kho Chi Nhánh',
  '/staff/orders/new': 'Tạo Đơn Mua',
  '/staff/orders': 'Danh Sách Đơn',
  '/staff/deposits/new': 'Tạo Đặt Cọc',
  '/staff/chat': 'Chat Khách Hàng',
  '/staff/transfer-requests': 'Yêu Cầu Điều Chuyển',
  '/staff/profile': 'Hồ Sơ Cá Nhân',
  '/staff/notifications': 'Thông Báo',
}

function getPageTitle(pathname: string): string {
  return pageTitles[pathname] ?? 'Staff Dashboard'
}

export function StaffDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <div className="flex min-h-screen overflow-hidden">
      <StaffSidebar />
      <StaffMobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-64">
        <StaffTopbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-[#F6F7F8] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
