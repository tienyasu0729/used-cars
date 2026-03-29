import { useBranchReports } from '@/hooks/useBranchReports'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FileSpreadsheet,
  FileDown,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Percent,
  Users,
} from 'lucide-react'
import { formatPrice } from '@/utils/format'
import { Link } from 'react-router-dom'

const KPIS = [
  { label: 'Doanh thu', value: '10.800.000.000 VNĐ', change: '+12.5%', positive: true, icon: DollarSign },
  { label: 'Số xe bán', value: '124', change: '-2.1%', positive: false, icon: ShoppingCart },
  { label: 'Giá TB', value: '87.096.000 VNĐ', change: '+5.4%', positive: true, icon: Percent },
  { label: 'Khách hàng mới', value: '42', change: '+8.0%', positive: true, icon: Users },
]

export function ManagerReportsPage() {
  const { data: reports } = useBranchReports()

  const chartData = (reports?.monthlyRevenue ?? []).map((v, i) => ({
    name: `T${i + 1}`,
    value: v,
  }))

  const maxBrandCount = Math.max(...(reports?.salesByBrand ?? []).map((b) => b.count), 1)

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link to="/manager/dashboard" className="transition-colors hover:text-[#1A3C6E]">
            Quản lý
          </Link>
          <span>/</span>
          <span className="text-slate-900">Báo Cáo</span>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
              Báo Cáo Chi Nhánh
            </h1>
            <p className="text-slate-500">
              Tổng quan hiệu suất Trung tâm Khu vực Đà Nẵng
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">‹</button>
              <div className="flex items-center gap-2 border-x border-slate-100 px-4">
                <Calendar className="h-5 w-5 text-[#1A3C6E]" />
                <span className="text-sm font-bold">1 - 31 Tháng 10, 2023</span>
              </div>
              <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">›</button>
            </div>
            <div className="flex gap-3">
              <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
                <FileSpreadsheet className="h-5 w-5" />
                Excel
              </button>
              <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1A3C6E]/90">
                <FileDown className="h-5 w-5" />
                Xuất PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                {kpi.label}
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C6E]/10">
                <kpi.icon className="h-5 w-5 text-[#1A3C6E]" />
              </div>
            </div>
            <p className="text-3xl font-bold leading-tight text-slate-900">{kpi.value}</p>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                kpi.positive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {kpi.positive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{kpi.change} so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Doanh Số Theo Thời Gian</h3>
            <select className="cursor-pointer border-none bg-transparent text-sm font-medium text-slate-500 focus:ring-0">
              <option>Theo ngày</option>
              <option>Theo tuần</option>
              <option>Theo tháng</option>
            </select>
          </div>
          <div className="h-64 min-h-[256px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#reportGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Xe Bán Theo Hãng</h3>
            <button className="text-sm font-bold text-[#1A3C6E] hover:underline">
              Xem Tất Cả
            </button>
          </div>
          <div className="space-y-4">
            {(reports?.salesByBrand ?? []).map((item, i) => {
              const pct = Math.min(100, (item.count / maxBrandCount) * 100)
              const opacity = 1 - i * 0.2
              return (
                <div key={item.brand} className="space-y-1">
                  <div className="mb-1 flex justify-between text-sm font-bold">
                    <span>{item.brand}</span>
                    <span>{item.count} xe</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1A3C6E]"
                      style={{ width: `${pct}%`, opacity }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold">Xe Bán Chạy Nhất</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Dòng Xe
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Số Lượng Bán
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Doanh Thu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reports?.topVehicles ?? []).map((v) => (
                  <tr key={v.name} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {v.image ? (
                            <img
                              src={v.image}
                              alt={v.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                              {v.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{v.sold}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#1A3C6E]">
                      {formatPrice(v.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold">Xếp Hạng Hiệu Suất Nhân Viên</h3>
            <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold uppercase text-emerald-700">
              Xuất Sắc
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nhân Viên Bán Hàng
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Đơn Đã Ký
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Hoàn Thành Mục Tiêu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Nguyễn Hoàng', role: 'Tư vấn cấp cao', deals: 28, target: '112%' },
                  { name: 'Phan Tú', role: 'Trưởng nhóm bán hàng', deals: 25, target: '104%' },
                  { name: 'Lê Minh', role: 'Tư vấn viên', deals: 18, target: '92%' },
                ].map((s) => (
                  <tr key={s.name} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-xs font-bold text-[#1A3C6E]">
                          {s.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">{s.deals}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-bold ${
                          parseInt(s.target.replace('%', ''), 10) >= 100
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {s.target}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
