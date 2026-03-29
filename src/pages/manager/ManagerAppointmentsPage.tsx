import { useCallback, useEffect, useState } from 'react'
import { Download, Plus, Calendar, List, Target, UserPlus, DollarSign } from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'
import { useManagerBookingMutations } from '@/hooks/useManagerBookingMutations'
import { AppointmentDetailModal } from '@/features/manager/components'
import { formatPrice } from '@/utils/format'
import { useAuthStore } from '@/store/authStore'
import type { ManagerAppointment } from '@/mock/mockManagerData'

const TYPE_LABELS: Record<string, string> = {
  test_drive: 'Lái Thử',
  consultation: 'Tham Quan',
  showroom: 'Tham Quan',
  appraisal: 'Định Giá',
  delivery: 'Bàn Giao',
}

const STATUS_LABELS: Record<string, string> = {
  Confirmed: 'Đã Xác Nhận',
  Pending: 'Chờ Xử Lý',
  Rescheduled: 'Đổi Lịch',
  Completed: 'Hoàn Thành',
  Cancelled: 'Đã Hủy',
}

function canManagerConfirm(status: string): boolean {
  return status === 'Pending' || status === 'Rescheduled'
}

function canManagerCancel(status: string): boolean {
  return status === 'Pending' || status === 'Confirmed' || status === 'Rescheduled'
}

function statusBadgeClass(status: string): string {
  if (status === 'Confirmed' || status === 'Completed') return 'bg-green-100 text-green-700'
  if (status === 'Pending' || status === 'Rescheduled') return 'bg-amber-100 text-amber-700'
  if (status === 'Cancelled') return 'bg-slate-200 text-slate-600'
  return 'bg-slate-100 text-slate-600'
}

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

export function ManagerAppointmentsPage() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : 1
  const { data: appointments, isLoading } = useAppointments()
  const { confirmBooking, cancelBooking, actionBookingId } = useManagerBookingMutations(branchId)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selected, setSelected] = useState<ManagerAppointment | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const openDetail = (a: ManagerAppointment) => {
    setSelected(a)
    setDetailOpen(true)
  }

  const apiErrorMessage = (e: unknown): string => {
    if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string') {
      return (e as { message: string }).message
    }
    return 'Thao tác thất bại. Vui lòng thử lại.'
  }

  const handleConfirm = useCallback(
    async (id: number) => {
      try {
        await confirmBooking(id)
      } catch (e) {
        window.alert(apiErrorMessage(e))
      }
    },
    [confirmBooking],
  )

  const handleCancelBooking = useCallback(
    async (id: number) => {
      try {
        await cancelBooking(id)
      } catch (e) {
        window.alert(apiErrorMessage(e))
      }
    },
    [cancelBooking],
  )

  useEffect(() => {
    if (!selected || !appointments?.length) return
    const fresh = appointments.find((a) => a.id === selected.id)
    if (fresh && fresh.status !== selected.status) setSelected(fresh)
  }, [appointments, selected])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  const list = appointments ?? []
  const { monday, sunday } = getWeekBounds()
  const weekList = list.filter((a) => {
    const d = new Date(a.date)
    return d >= monday && d <= sunday
  })
  const testDriveCount = weekList.filter((a) => a.type === 'test_drive').length
  const consultationCount = weekList.filter((a) => a.type === 'consultation').length
  const confirmedCount = list.filter((a) => a.status === 'Confirmed').length
  const completionRate = list.length > 0 ? Math.round((confirmedCount / list.length) * 100) : 0
  const uniqueCustomers = new Set(list.map((a) => a.customerName)).size
  const estRevenue = weekList.length * 500000000

  const kpis = [
    { icon: Calendar, label: 'Tổng Tuần Này', value: `${weekList.length} (${testDriveCount} lái thử + ${consultationCount} tham quan)` },
    { icon: Target, label: 'Tỷ Lệ Hoàn Thành', value: `${completionRate}%` },
    { icon: UserPlus, label: 'Khách Hàng Mới', value: uniqueCustomers },
    { icon: DollarSign, label: 'Doanh Thu Dự Kiến', value: formatPrice(estRevenue) },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Tổng Quan Lịch Hẹn
          </h1>
          <p className="text-slate-500">
            Quản lý lịch tham quan showroom và lái thử tại chi nhánh Đà Nẵng
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'list' ? 'bg-white text-[#1A3C6E] shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              <List className="h-4 w-4" />
              Danh Sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'calendar' ? 'bg-white text-[#1A3C6E] shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Lịch
            </button>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold transition-colors hover:bg-slate-50">
            <Download className="h-5 w-5" />
            Xuất
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90">
            <Plus className="h-5 w-5" />
            Lịch Hẹn Mới
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-[#1A3C6E]/10 p-2">
                <kpi.icon className="h-5 w-5 text-[#1A3C6E]" />
              </div>
              <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>
      {viewMode === 'calendar' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold">Tháng 3 năm 2025</span>
            <div className="flex gap-2">
              <button className="rounded p-1 hover:bg-slate-100">‹</button>
              <button className="rounded p-1 hover:bg-slate-100">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-bold uppercase text-slate-400">
                {d}
              </div>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px]" />
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1
              const dayStr = `2025-03-${String(day).padStart(2, '0')}`
              const dayAppointments = list.filter((a) => a.date === dayStr)
              return (
                <div
                  key={day}
                  className="min-h-[80px] rounded-lg border border-slate-100 p-2"
                >
                  <span className="text-sm font-semibold">{day}</span>
                  {dayAppointments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => openDetail(a)}
                      className="mt-1 block w-full truncate rounded bg-blue-100 px-2 py-0.5 text-left text-[10px] font-bold text-blue-700"
                    >
                      {a.customerName}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div
              key={a.id}
              onClick={() => openDetail(a)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#1A3C6E]/40"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[#1A3C6E]">
                    <span className="text-xs font-bold">{a.timeSlot}</span>
                    <span className="text-[10px] uppercase">Slot</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{a.customerName}</h4>
                    <p className="text-sm text-slate-500">
                      {TYPE_LABELS[a.type] ?? a.type}: {a.vehicleName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-xs text-slate-400">Nhân viên phụ trách</span>
                    <span className="text-sm font-semibold">{a.staffName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        a.type === 'test_drive'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {TYPE_LABELS[a.type] ?? a.type}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(a.status)}`}>
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                    <div
                      className="flex flex-wrap gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canManagerConfirm(a.status) && (
                        <button
                          type="button"
                          disabled={actionBookingId === Number(a.id)}
                          onClick={() => void handleConfirm(Number(a.id))}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actionBookingId === Number(a.id) ? '...' : 'Xác nhận'}
                        </button>
                      )}
                      {canManagerCancel(a.status) && (
                        <button
                          type="button"
                          disabled={actionBookingId === Number(a.id)}
                          onClick={() => {
                            if (!window.confirm('Hủy lịch hẹn này cho khách?')) return
                            void handleCancelBooking(Number(a.id))
                          }}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 font-medium text-slate-600">Chưa có lịch hẹn nào</p>
        </div>
      )}
      <AppointmentDetailModal
        appointment={selected}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConfirm={handleConfirm}
        onCancelBooking={handleCancelBooking}
        actionBookingId={actionBookingId}
      />
    </div>
  )
}
