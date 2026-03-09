import { Outlet, Link, useLocation } from 'react-router-dom'

const menuItems = [
  { label: 'Thông tin cá nhân', path: '/account/profile' },
  { label: 'Xe đã lưu', path: '/account/favorites' },
  { label: 'Lịch hẹn', path: '/account/appointments' },
  { label: 'Giao dịch', path: '/account/transactions' },
  { label: 'Ưu đãi', path: '/account/privileges' },
  { label: 'Yêu cầu hoàn tiền', path: '/account/refund-request' },
]

export function CustomerProfileLayout() {
  const location = useLocation()

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex gap-8">
        <aside className="w-56 shrink-0">
          <nav className="sticky top-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-lg text-sm ${
                  location.pathname === item.path
                    ? 'bg-[#FFEEE0] text-[#FF6600] font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
