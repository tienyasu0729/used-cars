/**
 * VehicleDetailPage — Trang chi tiết xe public
 *
 * Dùng useVehicleDetail hook (API-backed)
 * Hiển thị gallery, thông số, save button, booking placeholder
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useVehicleDetail } from '@/hooks/useVehicleDetail'
import { useSavedVehicles } from '@/hooks/useSavedVehicles'
import { useVehicles } from '@/hooks/useVehicles'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { VehicleDetailGallery } from '@/features/vehicles/components/VehicleDetailGallery'
import { DepositWizardModal } from '@/features/vehicles/components/DepositWizardModal'
import { formatPrice, formatMileage } from '@/utils/format'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { Phone, Calendar, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { BookingForm } from '@/components/booking/BookingForm'
import type { UserRole } from '@/types/auth.types'
import { isCustomerRole } from '@/utils/userRole'

const STAFF_ROLE_HINT: Partial<Record<UserRole, string>> = {
  BranchManager: 'quản lý chi nhánh',
  SalesStaff: 'nhân viên bán hàng',
  Admin: 'quản trị viên',
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const vehicleId = id ? parseInt(id, 10) : undefined
  const { vehicle, isLoading, error, isSaved, toggleSave, refetchVehicle } = useVehicleDetail(vehicleId)
  const { savedIds } = useSavedVehicles()
  const { isAuthenticated, user } = useAuthStore()
  const isCustomer = Boolean(user && isCustomerRole(user.role))
  /** Đặt cọc / lái thử theo nghiệp vụ chỉ cho tài khoản khách hàng — không phải “chưa đăng nhập”. */
  const canUseCustomerActions = isAuthenticated && isCustomer
  const staffRoleHint =
    user && !isCustomerRole(user.role) ? STAFF_ROLE_HINT[user.role as UserRole] : null

  useDocumentTitle(vehicle ? `Chi tiết xe - ${vehicle.title}` : 'Chi tiết xe')

  // Lấy xe tương tự (cùng category)
  const { vehicles: allVehicles } = useVehicles({ size: 20 })
  const similarVehicles = (() => {
    const seen = new Set<number>()
    return allVehicles
      .filter((v) => {
        if (v.category_id !== vehicle?.category_id || v.id === vehicle?.id) return false
        if (seen.has(v.id)) return false
        seen.add(v.id)
        return true
      })
      .slice(0, 4)
  })()

  const [activeTab, setActiveTab] = useState('specs')
  const [depositOpen, setDepositOpen] = useState(false)


  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  // Error state
  if (error || !vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">{error || 'Xe không tồn tại'}</h2>
        <p className="mt-2 text-slate-500">Xe này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link
          to="/vehicles"
          className="mt-6 inline-block rounded-lg bg-[#1A3C6E] px-8 py-3 font-bold text-white hover:bg-[#15325A]"
        >
          Quay lại danh sách xe
        </Link>
      </div>
    )
  }

  const listingHold = Boolean(vehicle.listing_hold_active)
  const depositAndBookingOpen = vehicle.status === 'Available' && !listingHold

  const similarContent = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {similarVehicles.map((v, i) => (
        <VehicleCard
          key={v.id}
          vehicle={v}
          showNewBadge={i === 0}
          compact
          initialSaved={savedIds.has(v.id)}
        />
      ))}
      {similarVehicles.length === 0 && (
        <p className="col-span-full text-center text-slate-500">Không có xe tương tự</p>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Gallery + Tabs */}
        <VehicleDetailGallery
          vehicle={vehicle}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          similarContent={similarContent}
        />

        {/* Sidebar thông tin */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Card giá + hành động */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">{vehicle.title}</h1>
            {vehicle.listing_id && (
              <p className="mt-1 text-xs font-mono text-slate-400">{vehicle.listing_id}</p>
            )}
            <p className="mt-3 text-3xl font-black text-[#E8612A]">{formatPrice(vehicle.price)}</p>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
              <div className="text-center">
                <p className="text-xs text-slate-500">Năm SX</p>
                <p className="font-bold">{vehicle.year}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Số km</p>
                <p className="font-bold">{formatMileage(vehicle.mileage)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Nhiên liệu</p>
                <p className="font-bold text-sm">{vehicle.fuel || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Hộp số</p>
                <p className="font-bold text-sm">{vehicle.transmission || '—'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={toggleSave}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 py-3 font-bold transition-all ${
                  isSaved
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-[#1A3C6E]/10 text-[#1A3C6E] hover:bg-[#1A3C6E] hover:text-white'
                }`}
              >
                {isSaved ? '❤️ Đã lưu' : '🤍 Lưu xe'}
              </button>

              {vehicle.status === 'Reserved' && vehicle.my_pending_deposit_id != null && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="mb-2 font-semibold">Bạn đang giữ chỗ xe này. Vui lòng hoàn tất thanh toán.</p>
                  <Link
                    to="/dashboard/deposits"
                    className="text-sm font-semibold text-[#1A3C6E] underline"
                  >
                    Xem đặt cọc &rarr;
                  </Link>
                </div>
              )}

              {vehicle.status === 'Reserved' && vehicle.my_pending_deposit_id == null && vehicle.my_confirmed_deposit_id != null && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                  <p className="mb-2 font-semibold">Xe đã được giữ chỗ bởi bạn.</p>
                  <Link
                    to="/dashboard/deposits"
                    className="text-sm font-semibold text-[#1A3C6E] underline"
                  >
                    Xem đặt cọc &rarr;
                  </Link>
                </div>
              )}

              {vehicle.status === 'Reserved' && vehicle.my_pending_deposit_id == null && vehicle.my_confirmed_deposit_id == null && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-900">
                  Xe đang được giữ chỗ. Vui lòng chọn xe khác hoặc liên hệ showroom.
                </div>
              )}

              {vehicle.status !== 'Reserved' && listingHold && vehicle.my_pending_deposit_id == null && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-900">
                  Xe đang có cọc / thanh toán đang xử lý. Vui lòng chọn xe khác hoặc liên hệ showroom.
                </div>
              )}

              {depositAndBookingOpen && (
                <>
                  {canUseCustomerActions ? (
                    <button
                      onClick={() => setDepositOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8612A] py-3 font-bold text-white shadow-lg shadow-[#E8612A]/20 transition-all hover:bg-[#d4551f] hover:shadow-[#E8612A]/30"
                    >
                      <Shield className="h-5 w-5" />
                      Đặt Cọc Ngay
                    </button>
                  ) : isAuthenticated && user && !isCustomer ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-sm text-slate-600">
                      <p>
                        Đặt cọc trên web chỉ dành cho{' '}
                        <strong className="text-slate-800">tài khoản khách hàng</strong>
                        {staffRoleHint ? (
                          <>
                            . Bạn đang đăng nhập với vai trò {staffRoleHint} — dùng tài khoản khách hàng để đặt cọc, hoặc
                            liên hệ showroom.
                          </>
                        ) : (
                          <>.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#E8612A]/20 bg-[#E8612A]/5 p-3 text-center">
                      <p className="mb-2 text-sm text-slate-600">Đăng nhập tài khoản khách hàng để đặt cọc giữ xe này.</p>
                      <Link
                        to={`/login?redirect=${encodeURIComponent(`/vehicles/${vehicle.id}`)}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#E8612A] px-5 py-2 text-sm font-bold text-white hover:bg-[#d4551f]"
                      >
                        <Shield className="h-4 w-4" />
                        Đăng nhập
                      </Link>
                    </div>
                  )}
                </>
              )}

              {depositAndBookingOpen && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Calendar className="h-4 w-4 text-[#1A3C6E]" />
                    Đặt lịch lái thử
                  </p>
                  {canUseCustomerActions ? (
                    <BookingForm vehicleId={vehicle.id} branchId={vehicle.branch_id} />
                  ) : isAuthenticated && user && !isCustomer ? (
                    <p className="text-center text-sm text-slate-600">
                      Đặt lịch lái thử trên web dành cho <strong className="text-slate-800">khách hàng</strong>
                      {staffRoleHint ? (
                        <> — tài khoản {staffRoleHint} không dùng luồng này.</>
                      ) : (
                        <>.</>
                      )}
                    </p>
                  ) : (
                    <div className="space-y-3 text-center text-sm text-slate-600">
                      <p>Đăng nhập tài khoản khách hàng để chọn ngày giờ lái thử.</p>
                      <Link
                        to={`/login?redirect=${encodeURIComponent(`/vehicles/${vehicle.id}`)}`}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-[#1A3C6E] py-3 font-bold text-white hover:bg-[#15325A]"
                      >
                        Đăng nhập
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact box */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-bold text-slate-900">Liên hệ tư vấn</h3>
            <Link
              to={`/contact?vehicleId=${encodeURIComponent(String(vehicle.id))}`}
              className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] py-3 font-bold text-white hover:bg-[#15325A]"
            >
              Gửi phiếu tư vấn xe này
            </Link>
            <a
              href="tel:19006868"
              className="flex items-center gap-3 rounded-lg bg-[#1A3C6E]/5 p-3 font-bold text-[#1A3C6E] hover:bg-[#1A3C6E]/10"
            >
              <Phone className="h-5 w-5" />
              1900 6868
            </a>
          </div>
        </div>
      </div>

      {/* Xe tương tự */}
      {similarVehicles.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-black">Xe Tương Tự</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarVehicles.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} showNewBadge={i === 0} initialSaved={savedIds.has(v.id)} />
            ))}
          </div>
        </section>
      )}
      {/* Deposit Wizard Modal */}
      <DepositWizardModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        vehicleId={vehicle.id}
        vehicleName={vehicle.title}
        vehiclePrice={vehicle.price}
        uiOnly={false}
        onDepositSuccess={() => refetchVehicle()}
      />
    </div>
  )
}
