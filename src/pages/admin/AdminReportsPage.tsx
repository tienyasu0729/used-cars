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
import { FileDown } from 'lucide-react'
import { downloadBlob, todayStr } from '@/utils/excelExport'
import axiosInstance from '@/utils/axiosInstance'

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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Báo Cáo Tổng Hệ Thống</h2>
          <p className="mt-1 text-slate-500">Phân tích doanh thu và hiệu suất theo chi nhánh</p>
        </div>
        <button
          onClick={async () => {
            try {
              const res = await axiosInstance.get('/admin/reports/export', { responseType: 'blob' })
              downloadBlob(res as unknown as Blob, `bao-cao-toan-he-thong-${todayStr()}.xlsx`)
            } catch { /* lỗi im lặng */ }
          }}
          className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <FileDown className="h-5 w-5" />
          Xuất Excel
        </button>
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
        <div className="h-80 min-h-[320px] w-full min-w-0">
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
        <div className="h-64 min-h-[256px] w-full min-w-0">
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
