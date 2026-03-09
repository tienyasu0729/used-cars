import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Plus, Calendar, MessageCircle, CreditCard, ShoppingBag, Star, Settings, Bell } from 'lucide-react'
import { Avatar, Logo } from '@/components'
import { useAuthStore } from '@/stores/authStore'

const showroomMenuGroups = [
  {
    title: 'Tổng quan',
    items: [{ label: 'Dashboard', path: '/showroom/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Kinh doanh',
    items: [
      { label: 'Kho xe của tôi', path: '/showroom/inventory', icon: Package },
      { label: 'Thêm xe', path: '/showroom/add-car', icon: Plus },
      { label: 'Lịch hẹn & Quét QR', path: '/showroom/appointments', icon: Calendar },
      { label: 'Khách hàng (Chat)', path: '/showroom/chat', icon: MessageCircle },
    ],
  },
  {
    title: 'Tài chính & Dịch vụ',
    items: [
      { label: 'Giao dịch & Hoa hồng', path: '/showroom/transactions', icon: CreditCard },
      { label: 'Mua gói dịch vụ', path: '/showroom/packages', icon: ShoppingBag },
    ],
  },
  {
    title: 'Cửa hàng',
    items: [
      { label: 'Đánh giá', path: '/showroom/reviews', icon: Star },
      { label: 'Hồ sơ Showroom', path: '/showroom/profile', icon: Settings },
    ],
  },
]

export function ShowroomLayout() {
  const location = useLocation()
  const { user } = useAuthStore()
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold text-gray-800">SCUDN</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {showroomMenuGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                      isActive(item.path)
                        ? 'bg-[#FFEEE0] text-[#FF6600] font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar name={user?.name ?? 'Showroom'} size="sm" />
              <span className="text-sm font-medium text-gray-700">{user?.name ?? 'Showroom'}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
