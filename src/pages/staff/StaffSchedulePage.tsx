import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useInventory } from '@/hooks/useInventory'
import { StaffScheduleCalendar } from '@/features/staff/components/StaffScheduleCalendar'
import { mockUsers } from '@/mock'
import type { StaffScheduleItem } from '@/mock/mockStaffSchedule'
import type { Booking } from '@/types/booking.types'
import type { Vehicle } from '@/types/vehicle.types'

const today = new Date().toISOString().slice(0, 10)
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

function bookingToScheduleItem(b: Booking, vehicles: Vehicle[]): StaffScheduleItem {
  const v = vehicles.find((x) => x.id === b.vehicleId)
  const cust = b.customerId != null ? mockUsers.find((u) => u.id === String(b.customerId)) : undefined
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
    customerName: cust?.name ?? `Khách #${b.customerId ?? '?'}`,
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

export function StaffSchedulePage() {
  const { bookings, schedule, isLoading, selectedDate, setSelectedDate } = useStaffBookings()
  const { data: inventory } = useInventory()

  const mergedSchedule = useMemo(() => {
    const vehicles = inventory ?? []
    const fromApi = apiScheduleToItems(schedule, vehicles)
    const fromBooks = (bookings ?? [])
      .filter((b) => b.bookingDate === selectedDate)
      .map((b) => bookingToScheduleItem(b, vehicles))
    const ids = new Set(fromApi.map((x) => x.bookingId).filter(Boolean))
    const extra = fromBooks.filter((b) => !ids.has(b.bookingId!))
    return [...fromApi, ...extra].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
  }, [bookings, schedule, inventory, selectedDate])

  const todaySchedule = useMemo(() => {
    return mergedSchedule.filter((s) => s.date === today)
  }, [mergedSchedule])

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lịch trình của tôi</h2>
            <p className="text-sm text-slate-500">Quản lý các cuộc hẹn lái thử và tư vấn</p>
          </div>
          <label className="flex flex-col text-xs font-medium text-slate-600">
            Ngày xem lịch
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
            </div>
          ) : (
            <StaffScheduleCalendar schedule={mergedSchedule} onAddAppointment={() => {}} />
          )}
        </div>
      </div>
      <aside className="w-full shrink-0 xl:w-80">
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
              {todaySchedule.length === 0 && !isLoading && (
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
      </aside>
    </div>
  )
}
