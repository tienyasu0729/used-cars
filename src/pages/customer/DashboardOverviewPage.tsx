import { Link } from 'react-router-dom'
import { Heart, Calendar, Shield, ShoppingBag } from 'lucide-react'
import { DashboardStatCard } from '@/features/customer/components/DashboardStatCard'
import { BookingCard } from '@/features/customer/components/BookingCard'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { useBookings } from '@/hooks/useBookings'
import { useDeposits } from '@/hooks/useDeposits'
import { useSavedVehicles } from '@/hooks/useSavedVehicles'
import { useOrders } from '@/hooks/useOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { useBranches } from '@/hooks/useBranches'
import { Button } from '@/components/ui'
import { EmptyState } from '@/components/ui'
import { formatPrice } from '@/utils/format'

export function DashboardOverviewPage() {
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError } = useBookings()
  const { data: deposits } = useDeposits()
  const { data: saved } = useSavedVehicles()
  const { data: orders } = useOrders()
  const { data: vehiclesData } = useVehicles()
  const { data: branches } = useBranches()

  const vehicles = vehiclesData?.data ?? []
  const recentVehicles = vehicles.slice(0, 4)
  const upcomingBookings = (bookings ?? []).filter(
    (b) => b.status === 'Confirmed' || b.status === 'Pending'
  ).slice(0, 3)
  const pendingCount = (bookings ?? []).filter((b) => b.status === 'Pending').length
  const activeDeposits = (deposits ?? []).filter((d) => d.status === 'Confirmed').length
  const totalDeposit = (deposits ?? [])
    .filter((d) => d.status === 'Confirmed')
    .reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chào mừng trở lại!</h1>
        <p className="mt-1 text-slate-500">Đây là tóm tắt hoạt động của bạn.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          icon={Heart}
          label="Xe Đã Lưu"
          value={saved?.length ?? 0}
          link="/dashboard/saved"
          linkText="xem tất cả →"
        />
        <DashboardStatCard
          icon={Calendar}
          label="Lịch Lái Thử"
          value={upcomingBookings.length}
          subLabel={`${pendingCount} chờ xác nhận`}
          link="/dashboard/bookings"
          linkText="xem tất cả →"
        />
        <DashboardStatCard
          icon={Shield}
          label="Đặt Cọc"
          value={activeDeposits}
          subLabel={`Tổng: ${formatPrice(totalDeposit)}`}
          link="/dashboard/deposits"
          linkText="xem tất cả →"
        />
        <DashboardStatCard
          icon={ShoppingBag}
          label="Đơn Đã Mua"
          value={orders?.length ?? 0}
          link="/dashboard/orders"
          linkText="xem tất cả →"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Lịch Hẹn Sắp Tới</h2>
            <Link to="/dashboard/bookings" className="text-sm font-medium text-[#1A3C6E] hover:underline">
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
            <div className="space-y-3">
              {upcomingBookings.map((b) => {
                const vehicle = vehicles.find((v) => v.id === b.vehicleId)
                const branch = branches?.find((br) => br.id === b.branchId)
                return (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    vehicle={vehicle}
                    branch={branch}
                  />
                )
              })}
            </div>
          )}
          <div className="mt-8 overflow-hidden rounded-2xl bg-[#1A3C6E] p-6 text-white">
            <h3 className="text-xl font-bold">Chưa tìm được xe ưng ý?</h3>
            <p className="mt-2 text-sm text-white/80">Khám phá thêm các mẫu xe mới về.</p>
            <Link to="/vehicles" className="mt-4 inline-block">
              <Button variant="accent">Khám Phá Ngay</Button>
            </Link>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Xe Đã Xem Gần Đây</h2>
            <Link to="/vehicles" className="text-sm font-medium text-[#1A3C6E] hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {recentVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
