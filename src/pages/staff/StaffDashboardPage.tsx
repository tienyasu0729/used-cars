import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MessageSquare, ShoppingBag, Package } from 'lucide-react'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useStaffDashboardStats } from '@/hooks/useStaffDashboardStats'
import { useInventory } from '@/hooks/useInventory'
import { StaffScheduleCalendar } from '@/features/staff/components/StaffScheduleCalendar'
import type { StaffScheduleItem } from '@/types/staffSchedule.types'
import { customerDisplayLabel } from '@/lib/customerDisplay'
import type { Booking } from '@/types/booking.types'
import type { Vehicle } from '@/types/vehicle.types'

const TYPE_LABELS: Record<string, string> = {
  test_drive: 'Lái thử',
  consultation: 'Tư vấn',
  contract: 'Ký hợp đồng',
  meeting: 'Họp nhóm',
  handover: 'Bàn giao',
}
const TYPE_BADGE: Record<string, string> = {
  test_drive: 'bg-blue-100 text-blue-700',
  consultation: 'bg-orange-100 text-orange-700',
  contract: 'bg-orange-100 text-orange-700',
  meeting: 'bg-slate-100 text-slate-600',
  handover: 'bg-slate-100 text-slate-600',
}

const today = new Date().toISOString().slice(0, 10)

function bookingToScheduleItem(b: Booking, vehicles: Vehicle[]): StaffScheduleItem {
  const v = vehicles.find((x) => x.id === b.vehicleId)
  const customerName =
    (b.customerName && b.customerName.trim()) || customerDisplayLabel(b.customerId)
  const customerPhone = b.customerPhone?.trim() || undefined
  const statusMap: Record<string, StaffScheduleItem['status']> = {
    Pending: 'pending',
    Confirmed: 'confirmed',
    Completed: 'completed',
    Cancelled: 'cancelled',
    Rescheduled: 'pending',
  }
  const [h, m] = b.timeSlot.split(':').map(Number)
  const endH = h + 1
  const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return {
    id: `b-${b.id}`,
    bookingId: String(b.id),
    customerId: String(b.customerId ?? ''),
    customerName,
    customerPhone,
    vehicleId: String(b.vehicleId),
    vehicleName: v ? `${v.brand ?? ''} ${v.model ?? ''}`.trim() || b.vehicleTitle : b.vehicleTitle,
    branchId: String(b.branchId),
    date: b.bookingDate,
    timeSlot: b.timeSlot,
    endTime,
    type: 'test_drive',
    status: statusMap[b.status] ?? 'pending',
  }
}

function apiScheduleToItems(
  schedule: { timeSlot: string; bookings: Booking[] }[],
  vehicles: Vehicle[]
): StaffScheduleItem[] {
  const out: StaffScheduleItem[] = []
  for (const g of schedule) {
    for (const b of g.bookings) {
      out.push(bookingToScheduleItem(b, vehicles))
    }
  }
  return out.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
}

export function StaffDashboardPage() {
  const { bookings, schedule, isLoading: staffLoading } = useStaffBookings()
  const { data: dashStats, isPending: dashStatsPending } = useStaffDashboardStats()
  const { data: inventory } = useInventory()

  const mergedSchedule = useMemo(() => {
    const vehicles = inventory ?? []
    const fromApi = apiScheduleToItems(schedule, vehicles)
    const fromBooks = (bookings ?? []).map((b) => bookingToScheduleItem(b, vehicles))
    const ids = new Set(fromApi.map((x) => x.bookingId).filter(Boolean))
    const extra = fromBooks.filter((b) => !ids.has(b.bookingId!))
    return [...fromApi, ...extra].sort((a, b) => {
      const da = a.date.localeCompare(b.date)
      return da !== 0 ? da : a.timeSlot.localeCompare(b.timeSlot)
    })
  }, [bookings, schedule, inventory])

  const todaySchedule = useMemo(
    () => mergedSchedule.filter((s) => s.date === today),
    [mergedSchedule]
  )

  const fmt = (n: number | undefined) => (dashStatsPending ? '—' : (n ?? 0))

  const kpis = [
    {
      icon: Calendar,
      label: 'Lịch Hẹn Hôm Nay',
      value: fmt(dashStats?.todayBookings),
      sub: 'Tại chi nhánh của bạn',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: MessageSquare,
      label: 'Tư Vấn Chờ Xử Lý',
      value: fmt(dashStats?.pendingConsultations),
      sub: 'Lịch hẹn đang chờ xác nhận',
      color: 'text-[#E8612A]',
      bg: 'bg-orange-100',
    },
    {
      icon: ShoppingBag,
      label: 'Đơn Hàng Tuần Này',
      value: fmt(dashStats?.weeklyOrders),
      sub: 'Từ thứ Hai đến Chủ nhật',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Package,
      label: 'Xe Còn Khả Dụng',
      value: fmt(dashStats?.availableVehicles),
      sub: 'Tại chi nhánh của bạn',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-slate-500">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
              <p className="text-xs font-medium text-slate-500">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lịch trình của tôi</h3>
            <p className="text-sm text-slate-500">Quản lý các cuộc hẹn lái thử và tư vấn</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {staffLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
              </div>
            ) : (
              <StaffScheduleCalendar schedule={mergedSchedule} onAddAppointment={() => {}} />
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Sự kiện hôm nay</h3>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#1A3C6E]">
                {new Date().getDate()} THÁNG {new Date().getMonth() + 1}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {todaySchedule.slice(0, 4).map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-xs font-medium text-slate-500">
                    {s.timeSlot} - {s.endTime || s.timeSlot}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${TYPE_BADGE[s.type] || TYPE_BADGE.meeting}`}
                  >
                    {TYPE_LABELS[s.type]}
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-slate-900">
                    {s.type === 'meeting' ? s.customerName : `${s.customerName} - ${s.vehicleName || ''}`}
                  </p>
                  {s.customerPhone && <p className="text-xs text-slate-600">{s.customerPhone}</p>}
                  {s.location && <p className="text-xs text-slate-500">{s.location}</p>}
                  {s.type !== 'meeting' && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${s.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`}
                      />
                      <span className="text-[10px] font-medium uppercase">
                        {s.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {todaySchedule.length === 0 && !staffLoading && (
                <p className="py-6 text-center text-xs text-slate-500">Không có sự kiện</p>
              )}
            </div>
            <Link
              to="/staff/bookings"
              className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-[#1A3C6E] hover:bg-slate-50"
            >
              Xem tất cả lịch hẹn
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Chú thích</h3>
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-400" />
                <span className="text-xs text-slate-700">Lái thử xe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-orange-400" />
                <span className="text-xs text-slate-700">Tư vấn/Ký hợp đồng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-slate-400" />
                <span className="text-xs text-slate-700">Khác/Nội bộ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
