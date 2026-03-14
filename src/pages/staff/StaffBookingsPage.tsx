import { useState } from 'react'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useBranches } from '@/hooks/useBranches'
import { useVehicles } from '@/hooks/useVehicles'
import { bookingApi } from '@/services/bookingApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui'
import { BookingDetailModal } from '@/features/staff/components/BookingDetailModal'
import type { Booking } from '@/types'

const tabs = ['Tất Cả', 'Chờ Xác Nhận', 'Đã Xác Nhận', 'Đã Hủy']

export function StaffBookingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const { data: bookings } = useStaffBookings()
  const { data: branches } = useBranches()
  const { data: vehicles } = useVehicles()
  const toast = useToastStore()
  const queryClient = useQueryClient()

  const filteredBookings = (bookings ?? []).filter((b) => {
    if (activeTab === 0) return true
    if (activeTab === 1) return b.status === 'Pending'
    if (activeTab === 2) return b.status === 'Confirmed'
    if (activeTab === 3) return b.status === 'Cancelled'
    return true
  })

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') return <Badge variant="pending">Chờ xác nhận</Badge>
    if (status === 'Confirmed') return <Badge variant="confirmed">Đã xác nhận</Badge>
    if (status === 'Cancelled') return <Badge variant="default">Đã hủy</Badge>
    return <Badge variant="available">Hoàn thành</Badge>
  }

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

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`border-b-2 px-6 py-4 text-sm font-bold ${
              activeTab === i ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Xe</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày / Giờ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map((b) => {
                const v = vehicles?.find((x) => x.id === b.vehicleId)
                return (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 overflow-hidden rounded bg-slate-200">
                          <img src={v?.images?.[0] || 'https://placehold.co/64x40'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm font-medium">{v?.brand} {v?.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">Khách #{b.customerId}</span>
                      <p className="text-xs text-slate-500">0905 *** ***</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{b.date} {b.timeSlot}</td>
                    <td className="px-6 py-4">{getStatusBadge(b.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDetailBooking(b)}
                        className="mr-2 rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Xem chi tiết
                      </button>
                      {b.status === 'Pending' && (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleConfirm(b)}
                            className="rounded-lg bg-green-100 px-3 py-1 text-xs font-bold text-green-700 hover:bg-green-200"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => window.confirm('Hủy lịch hẹn này?') && handleCancel(b)}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-50"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
