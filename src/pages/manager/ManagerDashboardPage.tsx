import { Link } from 'react-router-dom'
import { Car, Package, TrendingUp, Calendar, Download, CalendarDays } from 'lucide-react'
import { useManagerVehicles } from '@/hooks/useManagerVehicles'
import { useTransfers } from '@/hooks/useTransfers'
import { useAppointments } from '@/hooks/useAppointments'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useBranchReports } from '@/hooks/useBranchReports'

const chartData = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 140 },
  { name: 'Mar', value: 160 },
  { name: 'Apr', value: 90 },
  { name: 'May', value: 120 },
  { name: 'Jun', value: 60 },
  { name: 'Jul', value: 80 },
]

export function ManagerDashboardPage() {
  const { data: vehicles } = useManagerVehicles()
  const { data: transfers } = useTransfers()
  const { data: appointments } = useAppointments()
  const { data: reports } = useBranchReports()

  const totalVehicles = vehicles?.length ?? 0
  const availableVehicles = vehicles?.filter((v) => v.status === 'Available').length ?? 0
  const monthlySales = 48
  const pendingTransfers = transfers?.filter((t) => t.status === 'pending').length ?? 0
  const brandData = reports?.salesByBrand ?? []

  const kpis = [
    { icon: Package, label: 'Tổng xe trong chi nhánh', value: totalVehicles },
    { icon: Car, label: 'Xe đang bán', value: availableVehicles },
    { icon: TrendingUp, label: 'Doanh số tháng', value: monthlySales },
    { icon: Calendar, label: 'Yêu cầu điều chuyển chờ', value: pendingTransfers },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Tổng Quan Quản Lý
          </h2>
          <p className="mt-1 text-slate-500">
            Chào mừng trở lại. Tổng hợp hoạt động chi nhánh hôm nay.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <Download className="h-5 w-5" />
            Xuất Dữ Liệu
          </button>
          <Link
            to="/manager/appointments"
            className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <CalendarDays className="h-5 w-5" />
            Đặt Lịch Hẹn
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                {kpi.label}
              </p>
              <kpi.icon className="h-5 w-5 text-[#1A3C6E]" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Doanh Số Theo Tháng</h4>
                <p className="text-sm text-slate-500">Xu hướng doanh thu theo tháng trong năm</p>
              </div>
              <select className="rounded-lg border-slate-200 text-sm focus:ring-[#1A3C6E]/20">
                <option>6 Tháng Gần Nhất</option>
                <option>Cả Năm</option>
              </select>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A3C6E" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#1A3C6E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1A3C6E"
                    strokeWidth={2}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h4 className="text-lg font-bold text-slate-900">Xe Bán Theo Hãng</h4>
              <p className="text-sm text-slate-500">Phân bố xe bán theo hãng trong tháng</p>
            </div>
            <div className="space-y-4">
              {brandData.map((item, i) => (
                <div key={item.brand} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.brand}</span>
                    <span>{item.count} xe</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1A3C6E]"
                      style={{
                        width: `${Math.min(100, (item.count / 50) * 100)}%`,
                        opacity: 1 - i * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-6 text-lg font-bold text-slate-900">Hoạt Động Gần Đây</h4>
            <div className="space-y-6">
              {[
                { title: 'Đã Bán Xe', desc: 'Toyota Corolla Altis bán bởi Nguyễn Văn A', bg: 'bg-emerald-100', text: 'text-emerald-600' },
                { title: 'Lịch Hẹn Mới', desc: 'Lái thử Mazda CX-5 lúc 14:00', bg: 'bg-blue-100', text: 'text-blue-600' },
                { title: 'Cập Nhật Kho', desc: '3 xe Kia Seltos mới về showroom', bg: 'bg-amber-100', text: 'text-amber-600' },
              ].map((a) => (
                <div key={a.title} className="flex gap-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.bg} ${a.text}`}>
                    <Car className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.desc}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                      10 phút trước
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg bg-[#1A3C6E]/5 py-2 text-sm font-bold text-[#1A3C6E] transition-colors hover:bg-[#1A3C6E]/10">
              Xem Tất Cả
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-6 text-lg font-bold text-slate-900">Nhân Viên Xuất Sắc (Tháng Này)</h4>
            <div className="space-y-4">
              {[
                { name: 'Minh Tú', role: 'Tư vấn bán hàng', cars: 12, rev: '5.760.000.000 VNĐ' },
                { name: 'Hoàng Yến', role: 'Tư vấn bán hàng', cars: 9, rev: '4.440.000.000 VNĐ' },
                { name: 'Duy Anh', role: 'Tư vấn cấp cao', cars: 8, rev: '5.040.000.000 VNĐ' },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{s.cars} xe</p>
                    <p className="text-[10px] font-bold uppercase text-emerald-600">{s.rev}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
