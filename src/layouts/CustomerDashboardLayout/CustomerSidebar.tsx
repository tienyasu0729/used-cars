import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Heart,
  Eye,
  Calendar,
  Shield,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  Bell,
  Lock,
  LogOut,
  User,
  Camera,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { uploadAvatar } from '@/services/user.service'
import { resolveUploadPublicUrl } from '@/utils/mediaUrl'
import { useNotificationUnreadCount } from '@/hooks/useNotificationUnreadCount'
import { useBookings } from '@/hooks/useBookings'
import { useDeposits } from '@/hooks/useDeposits'
import { useConversations } from '@/hooks/useChats'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
  { to: '/dashboard/saved', icon: Heart, label: 'Xe Đã Lưu' },
  { to: '/dashboard/recently-viewed', icon: Eye, label: 'Xe Đã Xem' },
  { to: '/dashboard/bookings', icon: Calendar, label: 'Lịch Lái Thử', badgeKey: 'bookings' },
  { to: '/dashboard/deposits', icon: Shield, label: 'Đặt Cọc', badgeKey: 'deposits' },
  { to: '/dashboard/orders', icon: ShoppingBag, label: 'Đơn Mua' },
  { to: '/dashboard/transactions', icon: CreditCard, label: 'Giao Dịch' },
  { to: '/dashboard/chat', icon: MessageCircle, label: 'Chat', badgeKey: 'chat' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Thông Báo', badgeKey: 'notifications' },
  { to: '/dashboard/security', icon: Lock, label: 'Bảo Mật' },
]

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export function CustomerSidebar() {
  const { user, logout, patchUser } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { data: notificationUnread = 0 } = useNotificationUnreadCount()
  const { data: bookings } = useBookings()
  const { data: depData } = useDeposits({ size: 200 })
  const deposits = depData?.deposits ?? []
  const { data: conversations } = useConversations()

  const bookingPending = bookings?.filter((b) => b.status === 'Pending').length ?? 0
  const depositActive =
    deposits.filter((d) => ['Confirmed', 'Pending', 'RefundPending'].includes(d.status)).length ?? 0
  const chatUnread = conversations?.reduce((s, c) => s + (c.unreadCount ?? 0), 0) ?? 0

  const getBadge = (key: string) => {
    if (key === 'notifications') return notificationUnread
    if (key === 'bookings') return bookingPending
    if (key === 'deposits') return depositActive
    if (key === 'chat') return chatUnread
    return 0
  }

  const avatarSrc = resolveUploadPublicUrl(user?.avatarUrl ?? undefined)

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Chỉ chấp nhận file ảnh.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      addToast('error', 'Ảnh tối đa 2MB.')
      return
    }
    try {
      const url = await uploadAvatar(file)
      patchUser({ avatarUrl: url })
      addToast('success', 'Đã cập nhật ảnh đại diện')
    } catch {
      addToast('error', 'Tải ảnh thất bại. Thử JPG/PNG.')
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[220px] flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-full flex-col gap-1 p-4">
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#1A3C6E]/10">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[#1A3C6E]">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={onAvatarChange}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#1A3C6E] text-white shadow-md transition-opacity hover:opacity-90"
                aria-label="Đổi ảnh đại diện"
                title="Đổi ảnh đại diện"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{user?.name || 'Khách'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
            </div>
          </div>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-[#1A3C6E]' : 'text-[#1A3C6E] hover:bg-blue-50'
              }`
            }
          >
            <User className="h-4 w-4" />
            Hồ sơ cá nhân
          </NavLink>
        </div>
        {navItems.map((item) => {
          const badge = getBadge(item.badgeKey || '')
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-medium text-[#1A3C6E]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs font-medium text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Đăng Xuất
          </button>
        </div>
      </div>
    </aside>
  )
}
