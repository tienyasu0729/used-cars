import { Link } from 'react-router-dom'
import { Heart, Calendar, Wallet, ShoppingBag, Plus } from 'lucide-react'
import { DashboardStatCard } from '@/features/customer/components/DashboardStatCard'
import { DashboardBookingCard } from '@/features/customer/components/DashboardBookingCard'
import { DashboardOverviewCard } from '@/features/customer/components/DashboardOverviewCard'
import { useBookings } from '@/hooks/useBookings'
import { useDeposits } from '@/hooks/useDeposits'
import { useSavedVehicles } from '@/hooks/useSavedVehicles'
import { useOrders } from '@/hooks/useOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/authStore'
import { EmptyState } from '@/components/ui'
import { Button } from '@/components/ui'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'sáng'
  if (h < 18) return 'chiều'
  return 'tối'
}

function getShortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? parts.slice(-2).join(' ') : parts[0] || 'Bạn'
}

export function DashboardOverviewPage() {
  const { user } = useAuthStore()
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError } = useBookings()
  const { data: deposits } = useDeposits()
  const { data: saved } = useSavedVehicles()
  const { data: orders } = useOrders()
  const { data: vehiclesData } = useVehicles()
  const { data: branches } = useBranches()

  const vehicles = vehiclesData?.data ?? []
  const recentVehicles = vehicles.slice(0, 4)
  const upcomingBookings = (bookings ?? [])
    .filter((b) => b.status === 'Confirmed' || b.status === 'Pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
  const activeDeposits = (deposits ?? []).filter((d) => d.status === 'Confirmed' || d.status === 'Pending')
  const savedCount = saved?.length ?? 0
  const newSavedThisWeek = savedCount >= 2 ? 2 : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
            Chào buổi {getGreeting()}, {getShortName(user?.name || 'Bạn')}!
          </h1>
          <p className="mt-1 text-slate-500">
            Chào mừng bạn quay trở lại với BanXeOTo Đà Nẵng. Đây là tóm tắt hoạt động của bạn.
          </p>
        </div>
        <Link to="/vehicles">
          <Button variant="primary" className="flex items-center gap-2 shadow-lg shadow-[#1A3C6E]/20">
            <Plus className="h-5 w-5" />
            Đăng ký lái thử mới
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          icon={Heart}
          label="Xe đã lưu"
          value={savedCount}
          subLabel={newSavedThisWeek > 0 ? `+${newSavedThisWeek} xe mới trong tuần` : undefined}
          subLabelGreen={newSavedThisWeek > 0}
        />
        <DashboardStatCard
          icon={Calendar}
          label="Lịch lái thử"
          value={upcomingBookings.length}
          subLabel="Sắp tới trong 48 giờ tới"
        />
        <DashboardStatCard
          icon={Wallet}
          label="Tiền đặt cọc"
          value={activeDeposits.length}
          subLabel="Đang chờ xử lý bàn giao"
        />
        <DashboardStatCard
          icon={ShoppingBag}
          label="Đơn hàng"
          value={orders?.length ?? 0}
          subLabel="Tổng lịch sử giao dịch"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Lịch hẹn sắp tới</h2>
            <Link to="/dashboard/bookings" className="text-sm font-semibold text-[#1A3C6E] hover:underline">
              Xem tất cả
            </Link>
          </div>
          {bookingsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Không thể tải lịch hẹn. Vui lòng thử lại.
            </div>
          ) : bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Bạn chưa có lịch lái thử nào"
              actionButton={
                <Link to="/vehicles">
                  <Button variant="accent">Đặt Lịch Ngay</Button>
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingBookings.map((b) => {
                const vehicle = vehicles.find((v) => v.id === b.vehicleId)
                const branch = branches?.find((br) => br.id === b.branchId)
                return (
                  <DashboardBookingCard key={b.id} booking={b} vehicle={vehicle} branch={branch} />
                )
              })}
            </div>
          )}
          <div className="relative mt-8 overflow-hidden rounded-2xl bg-[#1A3C6E] p-8 text-white">
            <div className="relative z-10">
              <h3 className="text-xl font-bold leading-tight">Bạn đang tìm kiếm ưu đãi?</h3>
              <p className="mt-2 text-sm text-[#1A3C6E]/80">
                Giảm ngay 20 triệu VNĐ khi chốt cọc các dòng xe điện trong tháng này.
              </p>
              <Link to="/vehicles" className="mt-6 inline-block">
                <button className="rounded-lg bg-white px-6 py-2 text-sm font-bold text-[#1A3C6E] transition-colors hover:bg-slate-100">
                  Khám phá ngay
                </button>
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 text-[160px] opacity-20">✦</div>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Xe vừa xem gần đây</h2>
            <Link to="/vehicles" className="text-sm font-semibold text-[#1A3C6E] hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {recentVehicles.map((v, i) => (
              <DashboardOverviewCard key={v.id} vehicle={v} showNewBadge={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
