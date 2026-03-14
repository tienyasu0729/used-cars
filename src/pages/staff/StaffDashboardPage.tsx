import { Link } from 'react-router-dom'
import { Calendar, MessageSquare, ShoppingBag, Package, Schedule, List } from 'lucide-react'
import { useStaffBookings } from '@/hooks/useStaffBookings'
import { useConsultations } from '@/hooks/useConsultations'
import { useStaffOrders } from '@/hooks/useStaffOrders'
import { useInventory } from '@/hooks/useInventory'

const today = new Date().toISOString().slice(0, 10)

export function StaffDashboardPage() {
  const { data: bookings } = useStaffBookings()
  const { data: consultations } = useConsultations()
  const { data: orders, ordersToday, ordersThisWeek } = useStaffOrders()
  const { data: inventory, available } = useInventory()

  const todayBookings = (bookings ?? []).filter((b) => b.date === today)
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
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Schedule className="h-5 w-5 text-[#1A3C6E]" />
              Lịch trình hôm nay (08:00 - 18:00)
            </h3>
            <Link to="/staff/bookings" className="text-sm font-medium text-[#1A3C6E] hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute left-10 top-10 bottom-10 w-px bg-slate-200" />
            <div className="space-y-8">
              {todayBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="relative pl-12">
                  <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-blue-100 shadow">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-bold text-slate-400">{b.timeSlot}</p>
                    <p className="text-sm font-bold text-slate-900">Khách #{b.customerId}</p>
                    <p className="text-xs text-slate-500">Lái thử xe</p>
                    <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-0.5 text-[10px] font-bold uppercase text-green-700">
                      {b.status === 'Confirmed' ? 'Đã xác nhận' : b.status === 'Pending' ? 'Chờ xác nhận' : b.status}
                    </span>
                  </div>
                </div>
              ))}
              {todayBookings.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">Hôm nay chưa có lịch hẹn</p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
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
