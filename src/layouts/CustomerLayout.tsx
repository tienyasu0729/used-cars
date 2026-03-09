import { useRef, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { Logo } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'

const profileMenuItems = [
  { label: 'Thông tin cá nhân', path: '/account/profile' },
  { label: 'Lịch hẹn', path: '/account/appointments' },
  { label: 'Giao dịch', path: '/account/transactions' },
  { label: 'Ưu đãi', path: '/account/privileges' },
  { label: 'Yêu cầu hoàn tiền', path: '/account/refund-request' },
]

export function CustomerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthStore()
  const isHome = location.pathname === '/'

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => customerApi.getFavorites(),
    enabled: isAuthenticated,
  })

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuTimeoutRef = useRef<number | undefined>(undefined)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleProfileMenuEnter = () => {
    if (menuTimeoutRef.current !== undefined) window.clearTimeout(menuTimeoutRef.current)
    setShowProfileMenu(true)
  }

  const handleProfileMenuLeave = () => {
    menuTimeoutRef.current = window.setTimeout(() => setShowProfileMenu(false), 150)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-bold text-gray-900 text-lg">SCUDN</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`px-3 py-2 rounded text-sm font-medium ${
              isHome ? 'bg-[#FF6600] text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
          <a href="/news" className="text-gray-600 hover:text-gray-900 text-sm">News</a>
          <a href="/blog" className="text-gray-600 hover:text-gray-900 text-sm">Blog</a>
          <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">Contact</a>
          <Link to="/account/favorites" className="relative p-2 text-gray-400 hover:text-gray-600" aria-label="Favorites">
            <ShoppingCart className="w-5 h-5" />
            {isAuthenticated && favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#FF6600] text-white text-xs rounded-full">
                {favorites.length}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div
              className="relative"
              onMouseEnter={handleProfileMenuEnter}
              onMouseLeave={handleProfileMenuLeave}
            >
              <button type="button" className="p-2 text-gray-600 hover:text-gray-900" aria-label="Profile">
                <User className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 top-full pt-1 z-50 transition-opacity ${
                  showProfileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="py-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-[#FF6600] text-white rounded-lg text-sm font-medium hover:bg-[#e55c00]"
            >
              Login
            </Link>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Here text</h4>
            <p className="text-sm text-gray-500">Lorem ipsum placeholder content.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">There text</h4>
            <p className="text-sm text-gray-500">Lorem ipsum placeholder content.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Everywhere text</h4>
            <p className="text-sm text-gray-500">Lorem ipsum placeholder content.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-200 flex justify-between text-sm text-gray-500">
          <div className="flex gap-4">
            <a href="/features">Features</a>
            <a href="/learn">Learn more</a>
            <a href="/support">Support</a>
            {import.meta.env.DEV && (
              <a href="/swagger">API Docs</a>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
