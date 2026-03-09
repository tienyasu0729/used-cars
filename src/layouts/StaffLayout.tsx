import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, LogOut } from 'lucide-react'
import { Avatar, Logo } from '@/components'
import { useAuthStore } from '@/stores/authStore'

const navGroups = [
  {
    title: 'Công việc cần xử lý',
    items: [
      { label: 'Staff Dashboard', path: '/staff/dashboard' },
      { label: 'Car Approvals', path: '/staff/car-approvals' },
      { label: 'Review Approvals', path: '/staff/review-approvals' },
      { label: 'Fraud Reports', path: '/staff/fraud-reports' },
    ],
  },
  {
    title: 'Quản trị Nội dung (CMS)',
    items: [
      { label: 'Categories', path: '/staff/categories' },
      { label: 'Hot Cars', path: '/staff/hot-cars' },
      { label: 'Banners', path: '/staff/banners' },
      { label: 'Blog & FAQ', path: '/staff/blog-faq' },
      { label: 'Media Library', path: '/staff/media' },
      { label: 'SEO Settings', path: '/staff/seo' },
    ],
  },
  {
    title: 'Hỗ trợ & CSKH',
    items: [
      { label: 'Showroom Support', path: '/staff/showroom-support' },
      { label: 'Vouchers', path: '/staff/vouchers' },
      { label: 'Push Notifications', path: '/staff/notifications' },
    ],
  },
  {
    title: 'Công cụ giám sát',
    items: [
      { label: 'Appointment Flow', path: '/staff/appointment-flow' },
      { label: 'Refund Verification', path: '/staff/verification' },
      { label: 'Change History', path: '/staff/change-history' },
    ],
  },
]

export function StaffLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold text-gray-800">SCUDN</span>
            <span className="text-xs text-gray-500">STAFF</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6600] rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar name={user?.name ?? 'Staff'} size="sm" />
              <span className="text-sm font-medium text-gray-700">{user?.name ?? 'Staff'}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
