import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MessageSquare, ShoppingBag, Package, List } from 'lucide-react'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useStaffSchedule } from '@/hooks/useStaffSchedule'
import { useConsultations } from '@/hooks/useConsultations'
import { useStaffOrders } from '@/hooks/useStaffOrders'
import { useInventory } from '@/hooks/useInventory'
import { StaffScheduleCalendar } from '@/features/staff/components/StaffScheduleCalendar'
import { mockUsers } from '@/mock'
import type { StaffScheduleItem } from '@/mock/mockStaffSchedule'

const today = new Date().toISOString().slice(0, 10)
const TYPE_LABELS: Record<string, string> = { test_drive: 'Lái thử', consultation: 'Tư vấn', contract: 'Ký hợp đồng', meeting: 'Họp nhóm', handover: 'Bàn giao' }

function bookingToScheduleItem(b: { id: string; vehicleId: string; customerId: string; branchId: string; date: string; timeSlot: string; status: string }, vehicles: { id: string; brand: string; model: string }[]): StaffScheduleItem {
  const v = vehicles.find((x) => x.id === b.vehicleId)
  const cust = mockUsers.find((u) => u.id === b.customerId)
  const statusMap: Record<string, StaffScheduleItem['status']> = { Pending: 'pending', Confirmed: 'confirmed', Completed: 'completed', Cancelled: 'cancelled' }
  const [h, m] = b.timeSlot.split(':').map(Number)
  const endH = h + 1
  const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return {
    id: `b-${b.id}`,
    bookingId: b.id,
    customerId: b.customerId,
    customerName: cust?.name ?? `Khách #${b.customerId}`,
    vehicleId: b.vehicleId,
    vehicleName: v ? `${v.brand} ${v.model}` : '',
    branchId: b.branchId,
    date: b.date,
    timeSlot: b.timeSlot,
    endTime,
    type: 'test_drive',
    status: statusMap[b.status] ?? 'pending',
  }
}

export function StaffDashboardPage() {
  const { data: bookings } = useStaffBookings()
  const { data: schedule, isLoading: scheduleLoading } = useStaffSchedule()
  const { data: consultations } = useConsultations()
  const { data: orders, ordersToday, ordersThisWeek } = useStaffOrders()
  const { data: inventory, available } = useInventory()

  const todayBookings = (bookings ?? []).filter((b) => b.date === today)
  const todaySchedule = useMemo(() => {
    const fromSched = (schedule ?? []).filter((s) => s.date === today)
    const fromBooks = (bookings ?? []).filter((b) => b.date === today).map((b) => bookingToScheduleItem(b, inventory ?? []))
    const existingIds = new Set(fromSched.map((x) => x.bookingId).filter(Boolean))
    const extra = fromBooks.filter((b) => !existingIds.has(b.bookingId!))
    return [...fromSched, ...extra].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
  }, [schedule, bookings, inventory])
  const mergedSchedule = useMemo(() => {
    const sched = schedule ?? []
    const books = bookings ?? []
    const vehicles = inventory ?? []
    const existingIds = new Set(sched.map((x) => x.bookingId).filter(Boolean))
    const fromBookings = books.filter((b) => !existingIds.has(b.id)).map((b) => bookingToScheduleItem(b, vehicles))
    return [...sched, ...fromBookings]
  }, [schedule, bookings, inventory])
  const pendingConsultations = (consultations ?? []).filter((c) => c.status === 'pending')

  const kpis = [
    {
      icon: Calendar,
      label: 'Lịch Hẹn Hôm Nay',
      value: todayBookings.length,
      sub: 'cần xử lý',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: MessageSquare,
      label: 'Tư Vấn Chờ Xử Lý',
      value: pendingConsultations.length,
      sub: 'yêu cầu mới',
      color: 'text-[#E8612A]',
      bg: 'bg-orange-100',
    },
    {
      icon: ShoppingBag,
      label: 'Đơn Hàng Tuần Này',
      value: ordersThisWeek?.length ?? 0,
      sub: `Hôm nay: ${ordersToday.length}`,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Package,
      label: 'Xe Còn Khả Dụng',
      value: available?.length ?? 0,
      sub: 'tại chi nhánh',
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
        <div className="xl:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lịch trình của tôi</h3>
            <p className="text-sm text-slate-500">Quản lý các cuộc hẹn lái thử và tư vấn</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {scheduleLoading ? (
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
            <h3 className="text-sm font-bold text-slate-900">Sự kiện hôm nay</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">{new Date().getDate()} THÁNG {new Date().getMonth() + 1}</p>
            <div className="mt-3 space-y-3">
              {todaySchedule.slice(0, 4).map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{s.timeSlot} - {s.endTime || s.timeSlot}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{TYPE_LABELS[s.type]}</p>
                  <p className="text-xs text-slate-600">{s.customerName} - {s.vehicleName || ''}</p>
                  {s.location && <p className="text-xs text-slate-500">{s.location}</p>}
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${s.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-medium uppercase">{s.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'}</span>
                  </div>
                </div>
              ))}
              {todaySchedule.length === 0 && !scheduleLoading && <p className="py-4 text-center text-xs text-slate-500">Không có sự kiện</p>}
            </div>
            <Link to="/staff/bookings" className="mt-3 block text-center text-sm font-medium text-[#1A3C6E] hover:underline">
              Xem tất cả lịch hẹn
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Chú thích</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-blue-200" /><span className="text-xs text-slate-700">Lái thử xe</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-orange-200" /><span className="text-xs text-slate-700">Tư vấn/Ký hợp đồng</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-slate-200" /><span className="text-xs text-slate-700">Khác/Nội bộ</span></div>
            </div>
          </div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <List className="h-5 w-5 text-[#E8612A]" />
            Công việc cần làm
          </h3>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {pendingConsultations.slice(0, 3).map((c) => (
              <div key={c.id} className="cursor-pointer p-4 transition-colors hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      c.priority === 'high' ? 'bg-red-100 text-red-700' : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {c.priority === 'high' ? 'ƯU TIÊN CAO' : c.priority === 'medium' ? 'TRUNG BÌNH' : 'THẤP'}
                  </span>
                  <span className="text-[10px] text-slate-400">10 phút trước</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 hover:text-[#1A3C6E]">{c.message}</h4>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                  Khách hàng: {c.customerName} ({c.customerPhone})
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/staff/consultations"
                    className="rounded bg-[#1A3C6E] px-3 py-1 text-[10px] font-bold text-white"
                  >
                    XỬ LÝ
                  </Link>
                  <button className="rounded border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">
                    BỎ QUA
                  </button>
                </div>
              </div>
            ))}
            {pendingConsultations.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">Không có công việc chờ xử lý</p>
            )}
            <div className="p-4 text-center">
              <Link to="/staff/consultations" className="text-xs font-bold text-[#1A3C6E] hover:text-[#E8612A]">
                XEM TẤT CẢ NHIỆM VỤ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
