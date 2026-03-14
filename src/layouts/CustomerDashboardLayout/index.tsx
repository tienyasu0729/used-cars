import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CustomerSidebar } from './CustomerSidebar'
import { CustomerTopbar } from './CustomerTopbar'
import { MobileSidebar } from './MobileSidebar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng Quan',
  '/dashboard/profile': 'Thông Tin Cá Nhân',
  '/dashboard/saved': 'Xe Đã Lưu',
  '/dashboard/bookings': 'Lịch Lái Thử',
  '/dashboard/deposits': 'Đặt Cọc',
  '/dashboard/orders': 'Đơn Mua',
  '/dashboard/transactions': 'Giao Dịch',
  '/dashboard/chat': 'Chat',
  '/dashboard/notifications': 'Thông Báo',
  '/dashboard/security': 'Bảo Mật',
}

function getPageTitle(pathname: string): string {
  if (pathname.match(/^\/dashboard\/orders\/[^/]+$/)) return 'Chi Tiết Đơn Hàng'
  return pageTitles[pathname] ?? 'Bảng Điều Khiển'
}

export function CustomerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <CustomerSidebar />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <CustomerTopbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
