import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useBranches } from '@/hooks/useBranches'
import { useVehicles } from '@/hooks/useVehicles'
import { useToastStore } from '@/store/toastStore'
import { customerDisplayLabel } from '@/lib/customerDisplay'
import { BookingDetailModal } from '@/features/staff/components/BookingDetailModal'
import { BookingActionButtons } from '@/components/staff/BookingActionButtons'
import { Pagination } from '@/components/ui'
import type { Booking } from '@/types/booking.types'
import { getVehicleImageFromImages } from '@/utils/vehicleImage'
import { FallbackImage } from '@/components/common/FallbackImage'

const tabs = ['Tất cả', 'Đang xử lý', 'Đã xác nhận', 'Khách không đến', 'Đã hủy']

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatTime(slot: string) {
  const [h, m] = slot.split(':').map(Number)
  if (h < 12) return `${slot} sáng`
  if (h === 12) return `${slot} trưa`
  return `${String(h - 12).padStart(2, '0')}:${String(m).padStart(2, '0')} chiều`
}

function isOverdue(booking: Booking): boolean {
  const time = booking.timeSlot.length === 5 ? `${booking.timeSlot}:00` : booking.timeSlot
  const appointmentAt = new Date(`${booking.bookingDate}T${time}`)
  return !Number.isNaN(appointmentAt.getTime()) && appointmentAt.getTime() < Date.now()
}

function getStatusBadge(status: string) {
  if (status === 'AwaitingContract') return <span className="rounded border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">Chờ ký HĐ</span>
  if (status === 'Pending') return <span className="rounded border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Đang xử lý</span>
  if (status === 'Rescheduled') return <span className="rounded border border-orange-200 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">Đổi lịch</span>
  if (status === 'Confirmed') return <span className="rounded border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">Đã xác nhận</span>
  if (status === 'NoShow') return <span className="rounded border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">Khách không đến</span>
  if (status === 'Cancelled') return <span className="text-sm font-medium text-slate-500">Đã hủy</span>
  return <span className="rounded bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800">Hoàn thành</span>
}

export function StaffBookingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const {
    bookings,
    rescheduleBooking,
    completeBooking,
    cancelBooking,
  } = useStaffBookings()
  const { data: branches } = useBranches()
  const { vehicles } = useVehicles()
  const toast = useToastStore()

  const filteredBookings = useMemo(() => {
    const list = (bookings ?? []).filter((b) => {
      if (activeTab === 0) return true
      if (activeTab === 1) return b.status === 'Pending' || b.status === 'Rescheduled'
      if (activeTab === 2) return b.status === 'Confirmed'
      if (activeTab === 3) return b.status === 'NoShow'
      if (activeTab === 4) return b.status === 'Cancelled'
      return true
    })
    const order: Record<string, number> = {
      Pending: 0,
      Rescheduled: 1,
      Confirmed: 2,
      Completed: 3,
      NoShow: 4,
      Cancelled: 5,
    }
    return list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
  }, [bookings, activeTab])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredBookings.slice(start, start + pageSize)
  }, [filteredBookings, page, pageSize])

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = (bookings ?? []).filter((b) => b.bookingDate === today)
  const todayNew = todayBookings.filter((b) => b.status === 'Pending').length
  const pendingCount = (bookings ?? []).filter((b) => b.status === 'Pending' || b.status === 'Rescheduled').length
  const confirmedCount = (bookings ?? []).filter((b) => b.status === 'Confirmed').length
  const completedCount = (bookings ?? []).filter((b) => b.status === 'Completed').length
  const totalCount = (bookings ?? []).length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getCustomerName = (customerId: number | undefined) => customerDisplayLabel(customerId)

  const wrap = async (msgOk: string, fn: () => Promise<void>) => {
    try {
      await fn()
      toast.addToast('success', msgOk)
      setDetailBooking(null)
    } catch {
      toast.addToast('error', 'Thao tác thất bại')
    }
  }

  const vehicle = detailBooking ? vehicles?.find((x) => x.id === detailBooking.vehicleId) : null
  const branch = detailBooking ? branches?.find((b) => String(b.id) === String(detailBooking.branchId)) : null
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Lịch hẹn lái thử</h2>
        <p className="text-sm text-slate-500">Staff tiếp đón khách, kiểm tra hồ sơ, hỗ trợ sửa lỗi đơn giản và ghi nhận kết quả thực tế tại showroom.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tổng lịch hẹn hôm nay</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{todayBookings.length}</p>
          {todayNew > 0 && <p className="mt-0.5 text-xs font-medium text-green-600">+{todayNew} mới</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đang xử lý</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đã xác nhận</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{confirmedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tỷ lệ hoàn thành</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{completionRate}%</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setPage(1) }}
            className={`border-b-2 px-6 py-4 text-sm font-bold ${
              activeTab === i ? 'border-[#1A3C6E] bg-blue-50/50 text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mẫu xe</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày và giờ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginated.map((b) => {
                const v = vehicles?.find((x) => x.id === b.vehicleId)
                const customerName = getCustomerName(b.customerId)
                const detail = [v?.trim && `Bản ${v.trim}`, v?.exteriorColor].filter(Boolean).join(' - ') || '-'
                const overdue = (b.status === 'Confirmed' || b.status === 'Rescheduled') && isOverdue(b)
                const imageSources = [getVehicleImageFromImages(v?.images), b.vehicleImageUrl]

                return (
                  <tr
                    key={b.id}
                    onClick={() => setDetailBooking(b)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/vehicles/${b.vehicleId}?view=manager`}
                          onClick={(e) => e.stopPropagation()}
                          className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-transparent transition hover:ring-[#1A3C6E]/30"
                        >
                          <FallbackImage
                            sources={imageSources}
                            fallback="https://placehold.co/80x56?text=No+Image"
                            alt={b.vehicleTitle || 'Xe'}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div>
                          <p className="font-semibold text-slate-900">{b.vehicleTitle || `${v?.brand} ${v?.model} ${v?.year}`}</p>
                          <p className="text-xs text-slate-500">{detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{customerName}</p>
                      <p className="text-xs text-slate-500">SĐT: {b.customerPhone?.trim() || 'chưa có từ hệ thống'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{formatDate(b.bookingDate)}</p>
                      <p className="text-xs text-slate-500">{formatTime(b.timeSlot)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(b.status)}
                        {overdue && (
                          <span className="inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                            Quá giờ chờ khách
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailBooking(b)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                            title="Chi tiết"
                            type="button"
                          >
                            <Calendar className="h-5 w-5" />
                          </button>
                        </div>
                        <BookingActionButtons
                          booking={b}
                          onReschedule={(id, body) => wrap('Đã đổi lịch', () => rescheduleBooking(id, body))}
                          onComplete={(id) => wrap('Đã ghi nhận khách đã lái thử', () => completeBooking(id))}
                          onCancel={(id, note) => wrap('Đã hủy lịch hẹn', () => cancelBooking(id, note))}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filteredBookings.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
        label="lịch hẹn"
      />

      <BookingDetailModal
        booking={detailBooking}
        vehicle={vehicle ?? null}
        branchName={branch?.name}
        isOpen={!!detailBooking}
        onClose={() => setDetailBooking(null)}
      />
    </div>
  )
}
