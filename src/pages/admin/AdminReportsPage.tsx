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

export function AdminReportsPage() {
  const { data: reports } = useSystemReports()

  const revenueData = reports?.map((r: { branchName: string; revenue: number; vehiclesSold: number }) => ({
    name: r.branchName.replace('Chi Nhánh ', ''),
    doanhThu: r.revenue / 1e9,
    xeBan: r.vehiclesSold,
  })) ?? []

  const totalRevenue = reports?.reduce((s: number, r: { revenue: number }) => s + r.revenue, 0) ?? 0
  const totalSold = reports?.reduce((s: number, r: { vehiclesSold: number }) => s + r.vehiclesSold, 0) ?? 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Báo Cáo Tổng Hệ Thống</h2>
        <p className="mt-1 text-slate-500">Phân tích doanh thu và hiệu suất theo chi nhánh</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng doanh thu</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{(totalRevenue / 1e9).toFixed(1)} tỷ VND</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Xe đã bán</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalSold} xe</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-slate-900">Doanh thu theo chi nhánh</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}B`} />
              <Tooltip formatter={(v: unknown) => [`${v} tỷ VND`, 'Doanh thu']} />
              <Bar dataKey="doanhThu" fill="#1A3C6E" name="Doanh thu (tỷ)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-slate-900">Xe bán theo chi nhánh</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="xeBan" fill="#E8612A" name="Xe bán" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
