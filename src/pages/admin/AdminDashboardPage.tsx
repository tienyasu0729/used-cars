import { useState } from 'react'
import { TrendingUp, TrendingDown, Filter, Download, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useSystemReports } from '@/hooks/useSystemReports'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { mockTopSellingVehicles } from '@/mock/mockAdminData'
import { formatPriceNumber } from '@/utils/format'

const STATUS_LABELS: Record<string, string> = {
  LOW_STOCK: 'Tồn thấp',
  STABLE: 'Ổn định',
  HIGH_DEMAND: 'Nhu cầu cao',
}

const STATUS_CLASS: Record<string, string> = {
  LOW_STOCK: 'bg-green-100 text-green-700',
  STABLE: 'bg-blue-100 text-blue-700',
  HIGH_DEMAND: 'bg-red-100 text-red-700',
}

export function AdminDashboardPage() {
  const { data: users } = useUsers()
  const { data: reports } = useSystemReports()
  const [page, setPage] = useState(1)
  const [dateFilter, setDateFilter] = useState('30')

  const totalRevenue = reports?.reduce((s: number, r: { revenue: number }) => s + r.revenue, 0) ?? 0
  const totalSold = reports?.reduce((s: number, r: { vehiclesSold: number }) => s + r.vehiclesSold, 0) ?? 0
  const uniqueCustomers = users?.length ?? 0
  const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0
  const viewsCount = 8420
  const conversionRate = viewsCount > 0 ? ((totalSold / viewsCount) * 100).toFixed(1) : '0'

  const kpis = [
    { label: 'Doanh thu tổng', value: `₫${(totalRevenue / 1e9).toFixed(1)}B`, trend: 12.5, up: true },
    { label: 'Số xe bán', value: String(totalSold), trend: 8.2, up: true },
    { label: 'Giá TB', value: `₫${(avgPrice / 1e6).toFixed(0)}M`, trend: 2.1, up: false },
    { label: 'Khách hàng mới', value: String(uniqueCustomers), trend: 15.7, up: true },
    { label: 'Tỷ lệ chuyển đổi', value: `${conversionRate}%`, trend: 0.8, up: true },
  ]

  const revenueData = reports?.map((r: { branchName: string; revenue: number }) => ({
    name: r.branchName.replace('Chi Nhánh ', ''),
    value: r.revenue / 1e9,
  })) ?? []

  const funnelData = [
    { name: 'Lượt xem', value: viewsCount, pct: '100%' },
    { name: 'Đặt lịch', value: 1240, pct: '14.7%' },
    { name: 'Đặt cọc', value: 248, pct: '2.9%' },
    { name: 'Mua xe', value: totalSold, pct: `${conversionRate}%` },
  ]

  const topVehicles = mockTopSellingVehicles
  const perPage = 4
  const totalPages = Math.ceil(topVehicles.length / perPage)
  const paginated = topVehicles.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng Quan Hệ Thống</h2>
          <p className="mt-1 text-slate-500">Phân tích hiệu suất toàn hệ thống và so sánh chi nhánh</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDateFilter('30')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${dateFilter === '30' ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            30 ngày qua
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Q3 2025
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Tùy chọn
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Tất cả chi nhánh
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{kpi.value}</p>
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {kpi.trend}%
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-2 text-lg font-semibold text-slate-900">So sánh chi nhánh</h4>
          <p className="mb-4 text-sm text-slate-500">Doanh thu (tỷ ₫)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}B`} />
                <Tooltip formatter={(v: unknown) => [`${v} tỷ ₫`, 'Doanh thu']} />
                <Bar dataKey="value" fill="#1A3C6E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-2 text-lg font-semibold text-slate-900">Phễu bán hàng</h4>
          <p className="mb-4 text-sm text-slate-500">Các bước chuyển đổi</p>
          <div className="space-y-3">
            {funnelData.map((row, i) => (
              <div key={row.name} className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-sm font-medium text-slate-700">{row.name}</div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded bg-[#1A3C6E]"
                    style={{ width: `${Math.max(10, (row.value / viewsCount) * 100)}%` }}
                  />
                </div>
                <div className="flex w-20 shrink-0 justify-between text-xs">
                  <span className="font-medium text-slate-600">{formatPriceNumber(row.value)}</span>
                  <span className="text-slate-500">{row.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Star className="h-5 w-5 text-amber-500" />
            Xe bán chạy nhất
          </h4>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Xuất PDF
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Xuất Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mẫu xe</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Số lượng</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Chi nhánh tốt nhất</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Doanh thu</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={v.image} alt="" className="h-12 w-20 rounded object-cover" />
                      <div>
                        <p className="font-semibold text-slate-900">{v.name}</p>
                        <p className="text-xs text-slate-500">{v.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.totalUnits} xe</td>
                  <td className="px-4 py-3 text-slate-600">{v.topBranch}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">₫{(v.revenue / 1e9).toFixed(1)}B</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${STATUS_CLASS[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            Hiển thị {(page - 1) * perPage + 1} - {Math.min(page * perPage, topVehicles.length)} trong {topVehicles.length} xe
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium ${
                  page === p ? 'bg-[#1A3C6E] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
