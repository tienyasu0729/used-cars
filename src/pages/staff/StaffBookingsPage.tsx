import { useState, useMemo } from 'react'
import { Check, Calendar, X } from 'lucide-react'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useBranches } from '@/hooks/useBranches'
import { useVehicles } from '@/hooks/useVehicles'
import { bookingApi } from '@/services/bookingApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { mockUsers } from '@/mock'
import { Badge } from '@/components/ui'
import { BookingDetailModal } from '@/features/staff/components/BookingDetailModal'
import type { Booking } from '@/types'

const PAGE_SIZE = 4
const tabs = ['Tất Cả', 'Chờ Xác Nhận', 'Đã Xác Nhận', 'Đã Hủy']

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

function maskPhone(phone: string) {
  if (!phone || phone.length < 4) return '*** *** ***'
  const first4 = phone.slice(0, 4)
  return `${first4} *** ***`
}

export function StaffBookingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const { data: bookings } = useStaffBookings()
  const { data: branches } = useBranches()
  const { data: vehiclesData } = useVehicles()
  const vehicles = vehiclesData?.data ?? []
  const toast = useToastStore()
  const queryClient = useQueryClient()

  const filteredBookings = useMemo(() => {
    return (bookings ?? []).filter((b) => {
      if (activeTab === 0) return true
      if (activeTab === 1) return b.status === 'Pending'
      if (activeTab === 2) return b.status === 'Confirmed'
      if (activeTab === 3) return b.status === 'Cancelled'
      return true
    })
  }, [bookings, activeTab])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredBookings.slice(start, start + PAGE_SIZE)
  }, [filteredBookings, page])

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = (bookings ?? []).filter((b) => b.date === today)
  const todayNew = todayBookings.filter((b) => b.status === 'Pending').length
  const pendingCount = (bookings ?? []).filter((b) => b.status === 'Pending').length
  const confirmedCount = (bookings ?? []).filter((b) => b.status === 'Confirmed').length
  const completedCount = (bookings ?? []).filter((b) => b.status === 'Completed').length
  const totalCount = (bookings ?? []).length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') return <Badge variant="pending">Chờ xác nhận</Badge>
    if (status === 'Confirmed') return <Badge variant="confirmed">Đã xác nhận</Badge>
    if (status === 'Cancelled') return <span className="text-sm text-slate-500">Đã hủy</span>
    return <Badge variant="available">Hoàn thành</Badge>
  }

  const getCustomer = (customerId: string) => mockUsers.find((u) => u.id === customerId)

  const handleConfirm = async (booking?: Booking) => {
    const b = booking ?? detailBooking
    if (!b) return
    try {
      await bookingApi.confirmBooking(b.id)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.addToast('success', 'Đã xác nhận lịch hẹn')
      setDetailBooking(null)
    } catch {
      toast.addToast('error', 'Không thể xác nhận')
    }
  }

  const handleCancel = async (booking?: Booking) => {
    const b = booking ?? detailBooking
    if (!b) return
    try {
      await bookingApi.cancelBooking(b.id)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.addToast('success', 'Đã hủy lịch hẹn')
      setDetailBooking(null)
    } catch {
      toast.addToast('error', 'Không thể hủy')
    }
  }

  const vehicle = detailBooking ? vehicles?.find((v) => v.id === detailBooking.vehicleId) : null
  const branch = detailBooking ? branches?.find((b) => b.id === detailBooking.branchId) : null
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE) || 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Lịch Hẹn Lái Thử</h2>
        <p className="text-sm text-slate-500">Quản lý và điều phối các yêu cầu lái thử xe từ khách hàng tại khu vực Đà Nẵng.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tổng lịch hẹn hôm nay</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{todayBookings.length}</p>
          {todayNew > 0 && <p className="mt-0.5 text-xs font-medium text-green-600">+{todayNew} mới</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Chờ xác nhận</p>
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày & Giờ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginated.map((b) => {
                const v = vehicles?.find((x) => x.id === b.vehicleId)
                const cust = getCustomer(b.customerId)
                const detail = [v?.trim && `Bản ${v.trim}`, v?.exteriorColor].filter(Boolean).join(' - ') || '-'
                return (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                          <img src={v?.images?.[0] || 'https://placehold.co/80x56'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{v?.brand} {v?.model} {v?.year}</p>
                          <p className="text-xs text-slate-500">{detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{cust?.name ?? `Khách #${b.customerId}`}</p>
                      <p className="text-xs text-slate-500">{cust?.phone ? maskPhone(cust.phone) : '*** *** ***'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{formatDate(b.date)}</p>
                      <p className="text-xs text-slate-500">{formatTime(b.timeSlot)}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(b.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {b.status === 'Cancelled' ? (
                        <button
                          onClick={() => setDetailBooking(b)}
                          className="text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                          Xem chi tiết
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleConfirm(b)}
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                              title="Xác nhận"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDetailBooking(b)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Sửa lịch"
                          >
                            <Calendar className="h-5 w-5" />
                          </button>
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => window.confirm('Hủy lịch hẹn này?') && handleCancel(b)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Hủy"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Hiển thị {filteredBookings.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredBookings.length)} trong {filteredBookings.length} lịch hẹn
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
              const p = totalPages <= 6 ? i + 1 : (page <= 3 ? i + 1 : page <= totalPages - 2 ? page - 2 + i : totalPages - 5 + i)
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium ${
                    page === p ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <BookingDetailModal
        booking={detailBooking}
        vehicle={vehicle ?? null}
        branchName={branch?.name}
        isOpen={!!detailBooking}
        onClose={() => setDetailBooking(null)}
        onConfirm={handleConfirm}
        onCancel={() => window.confirm('Hủy lịch hẹn?') && handleCancel()}
      />
    </div>
  )
}
