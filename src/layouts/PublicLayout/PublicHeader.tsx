import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, ChevronDown, User, LayoutDashboard, LogOut, GitCompare } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCompareStore } from '@/store/compareStore'
import { BrandLogo } from '@/components/common/BrandLogo'
import type { UserRole } from '@/types'

function getDashboardPath(role: UserRole): string {
  const map: Record<UserRole, string> = {
    Customer: '/dashboard',
    SalesStaff: '/staff/dashboard',
    BranchManager: '/manager/dashboard',
    Admin: '/admin',
    Guest: '/',
  }
  return map[role] ?? '/dashboard'
}

function getProfilePath(role: UserRole | string): string {
  const r = String(role)
  if (r === 'Customer' || r === 'customer') return '/dashboard/profile'
  if (r === 'SalesStaff' || r === 'staff') return '/staff/profile'
  if (r === 'BranchManager' || r === 'manager') return '/manager/profile'
  if (r === 'Admin' || r === 'admin') return '/admin'
  return '/dashboard/profile'
}

const navLinks = [
  { to: '/vehicles', label: 'Mua Xe' },
  { to: '/branches', label: 'Chi Nhánh' },
  { to: '/contact', label: 'Liên Hệ' },
  { to: '/about', label: 'Về Chúng Tôi' },
]

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const compareEntries = useCompareStore((s) => s.entries)
  const clearCompare = useCompareStore((s) => s.clear)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/vehicles?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileOpen(false)
    } else {
      navigate('/vehicles')
    }
  }

  const handleLogout = () => {
    logout()
    setAvatarOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#1A3C6E]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <BrandLogo variant="dark" logoHeight={32} />

        <form onSubmit={handleSearch} className="mx-6 hidden max-w-md flex-1 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm xe theo hãng, đời, giá..."
              className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-white hover:text-white/90"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/compare"
            title={
              compareEntries.length > 0
                ? compareEntries.map((e) => e.title).join(' · ')
                : 'So sánh 2–3 xe'
            }
            className={`relative flex max-w-[min(100%,14rem)] items-center gap-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:text-white/90 ${
              compareEntries.length > 0 ? 'bg-white/15 px-2 py-1 ring-2 ring-amber-300/90' : 'py-1'
            }`}
          >
            <GitCompare className={`h-4 w-4 shrink-0 ${compareEntries.length > 0 ? 'text-amber-200' : ''}`} />
            <span className="shrink-0">So sánh</span>
            {compareEntries.length > 0 && (
              <>
                <span className="group relative inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8612A] px-1.5">
                  <span className="text-xs font-bold text-white transition-opacity duration-150 group-hover:opacity-0">
                    {compareEntries.length}
                  </span>
                  <button
                    type="button"
                    title="Xóa danh sách so sánh"
                    aria-label="Xóa danh sách so sánh"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-[#c94f22] text-white opacity-0 transition-opacity duration-150 hover:bg-[#b8461e] group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearCompare()
                    }}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </span>
                <span className="hidden min-w-0 truncate text-xs font-medium text-white/90 xl:inline">
                  {compareEntries.map((e) => e.title.split(/\s+/).slice(0, 3).join(' ')).join(' · ')}
                </span>
              </>
            )}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2 rounded-full border border-white/30 p-1 pr-2 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-white" />
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-white/20 bg-[#1A3C6E] py-2 shadow-xl">
                  <Link
                    to={getProfilePath(user.role)}
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </Link>
                  <Link
                    to={getDashboardPath(user.role)}
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Bảng điều khiển
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="rounded-lg border-2 border-white bg-transparent px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                  Đăng Nhập
                </button>
              </Link>
              <Link to="/register">
                <button className="rounded-lg border-2 border-[#E8612A] bg-[#E8612A] px-4 py-2 text-sm font-bold text-white ring-2 ring-white/30 hover:bg-orange-600">
                  Đăng Ký
                </button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-white lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A3C6E] lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" onClick={() => setMobileOpen(false)} aria-label="Go to homepage">
              <BrandLogo variant="dark" linkTo={null} logoHeight={28} />
            </Link>
            <button onClick={() => setMobileOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSearch} className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm xe theo hãng, đời, giá..."
                className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/60"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg py-3 text-lg font-medium text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/compare"
              onClick={() => setMobileOpen(false)}
              className={`flex flex-col gap-1 rounded-lg py-3 text-lg font-medium text-white hover:bg-white/10 ${
                compareEntries.length > 0 ? 'bg-white/10 px-2 ring-1 ring-amber-300/80' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <GitCompare className="h-4 w-4" />
                So sánh
                {compareEntries.length > 0 && (
                  <>
                    <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs font-bold">
                      {compareEntries.length}
                    </span>
                    <button
                      type="button"
                      title="Xóa danh sách so sánh"
                      aria-label="Xóa danh sách so sánh"
                      className="rounded p-1 text-white/90 hover:bg-white/15 lg:hidden"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearCompare()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </span>
              {compareEntries.length > 0 && (
                <span className="pl-6 text-xs font-normal text-white/80">
                  {compareEntries.map((e) => e.title).join(' · ')}
                </span>
              )}
            </Link>
          </nav>
          <div className="mt-4 flex gap-2 px-4">
            {user ? (
              <>
                <Link to={getDashboardPath(user.role)} className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button className="w-full rounded-lg border border-white py-2 text-white">Bảng điều khiển</button>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileOpen(false)
                  }}
                  className="flex-1 rounded-lg bg-white/20 py-2 text-white"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button className="w-full rounded-lg border border-white py-2 text-white">Đăng Nhập</button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button className="w-full rounded-lg bg-[#E8612A] py-2 font-bold text-white">Đăng Ký</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
