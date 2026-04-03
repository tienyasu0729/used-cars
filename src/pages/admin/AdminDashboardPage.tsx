import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSystemReports } from '@/hooks/useSystemReports'
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats'
import { useAdminDashboardCatalogSales } from '@/hooks/useAdminDashboardCatalogSales'
import { useBranchesAdmin } from '@/hooks/useBranchesAdmin'
import { AdminDashboardFilters, type DashboardDatePreset } from './AdminDashboardFilters'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPriceNumber } from '@/utils/format'

export function AdminDashboardPage() {
  const { data: stats } = useAdminDashboardStats()
  const { data: catalogSales, isLoading: catalogLoading } = useAdminDashboardCatalogSales(true)
  const { data: reports } = useSystemReports()
  const { data: branches = [] } = useBranchesAdmin()
  const [page, setPage] = useState(1)
  const [datePreset, setDatePreset] = useState<DashboardDatePreset>('30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [branchId, setBranchId] = useState<'all' | string>('all')

  const branchFilteredReports = useMemo(() => {
    const rows = reports ?? []
    if (branchId === 'all') return rows
    const name = branches.find((b) => b.id === branchId)?.name
    if (!name) return rows
    return rows.filter((r: { branchName: string }) => r.branchName === name)
  }, [reports, branchId, branches])

  const topModels = catalogSales?.topModels ?? []
  const topBrands = catalogSales?.topBrands ?? []
  const perPage = 8
  const totalPages = Math.max(1, Math.ceil(topModels.length / perPage))
  const paginated = topModels.slice((page - 1) * perPage, page * perPage)

  const revenueFromBranches = branchFilteredReports.reduce((s: number, r: { revenue: number }) => s + r.revenue, 0)
  const totalRevenue = revenueFromBranches > 0 ? revenueFromBranches : (stats?.totalRevenue ?? 0)
  const revenueKpiText = totalRevenue > 0 ? `₫${(totalRevenue / 1e9).toFixed(1)}B` : 'Chưa có dữ liệu'
  const totalSold = stats?.totalVehiclesSold ?? 0
  const inventory = stats?.totalInventory ?? 0
  const newCustomers = stats?.newCustomers ?? 0
  const activeBranches = stats?.activeBranches ?? 0
  const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0
  const viewsCount = 0
  const conversionRate = viewsCount > 0 ? ((totalSold / viewsCount) * 100).toFixed(1) : '0'

  const kpis = [
    { label: 'Doanh thu tổng', value: revenueKpiText, trend: 0, up: true },
    { label: 'Số xe bán (hệ thống)', value: String(totalSold), trend: 0, up: true },
    { label: 'Tồn kho', value: String(inventory), trend: 0, up: true },
    { label: 'Giá TB', value: totalSold > 0 ? `₫${(avgPrice / 1e6).toFixed(0)}M` : '—', trend: 0, up: true },
    { label: 'KH mới (tháng)', value: String(newCustomers), trend: 0, up: true },
    { label: 'Chi nhánh hoạt động', value: String(activeBranches), trend: 0, up: true },
    { label: 'Tỷ lệ chuyển đổi', value: `${conversionRate}%`, trend: 0, up: true },
  ]

  const revenueData = branchFilteredReports.map((r: { branchName: string; revenue: number }) => ({
    name: r.branchName.replace('Chi Nhánh ', ''),
    value: r.revenue / 1e9,
  }))
  const hasRevenueChartData = revenueData.some((r) => r.value > 0)

  const funnelData = [
    { name: 'Lượt xem', value: viewsCount, pct: '—' },
    { name: 'Đặt lịch', value: 0, pct: '—' },
    { name: 'Đặt cọc', value: 0, pct: '—' },
    { name: 'Mua xe', value: totalSold, pct: totalSold > 0 ? `${totalSold}` : '—' },
  ]

  const funnelMax = Math.max(...funnelData.map((r) => r.value), 1)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng Quan Hệ Thống</h2>
          <p className="mt-1 text-slate-500">Phân tích hiệu suất toàn hệ thống và so sánh chi nhánh</p>
        </div>
        <AdminDashboardFilters
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFrom={setCustomFrom}
          onCustomTo={setCustomTo}
          branchId={branchId}
          onBranchId={setBranchId}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
          <div className="h-64 min-h-[256px] w-full min-w-0">
            {!hasRevenueChartData ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Chưa có dữ liệu doanh thu theo chi nhánh.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}B`} />
                  <Tooltip formatter={(v: unknown) => [`${v} tỷ ₫`, 'Doanh thu']} />
                  <Bar dataKey="value" fill="#1A3C6E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-2 text-lg font-semibold text-slate-900">Phễu bán hàng</h4>
          <p className="mb-4 text-sm text-slate-500">Các bước chuyển đổi</p>
          <div className="space-y-3">
            {funnelData.map((row) => (
              <div key={row.name} className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-sm font-medium text-slate-700">{row.name}</div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded bg-[#1A3C6E]"
                    style={{ width: `${Math.max(8, (row.value / funnelMax) * 100)}%` }}
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Star className="h-5 w-5 text-amber-500" />
              Hãng xe bán nhiều nhất (theo số xe đã bán)
            </h4>
            <p className="mt-1 text-sm text-slate-500">Nhóm theo category — dữ liệu thật từ kho xe</p>
          </div>
          <div className="overflow-x-auto p-4">
            {catalogLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">Đang tải…</div>
            ) : topBrands.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">Chưa có hãng nào có xe trạng thái Đã bán.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topBrands.map((b) => (
                  <span
                    key={b.categoryId}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium text-slate-800">{b.brandName}</span>
                    <span className="text-slate-500">{b.soldCount} xe</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Star className="h-5 w-5 text-amber-500" />
            Dòng xe bán nhiều nhất
          </h4>
          <p className="mt-1 text-sm text-slate-500">Nhóm theo dòng xe (subcategory) — chỉ xe đã bán</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Dòng xe</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Hãng</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Đã bán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {catalogLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">
                    Đang tải…
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">
                    Chưa có dòng xe nào có trạng thái Đã bán.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.subcategoryId} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.modelName}</td>
                    <td className="px-4 py-3 text-slate-600">{row.brandName}</td>
                    <td className="px-4 py-3 text-slate-600">{row.soldCount} xe</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {topModels.length === 0
              ? 'Không có mục nào'
              : `Hiển thị ${(page - 1) * perPage + 1} - ${Math.min(page * perPage, topModels.length)} trong ${topModels.length} dòng`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium ${
                  page === p ? 'bg-[#1A3C6E] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
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
