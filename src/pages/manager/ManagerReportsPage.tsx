import { useBranchReports } from '@/hooks/useBranchReports'
import { useAuthStore } from '@/store/authStore'
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
  DollarSign,
  ShoppingCart,
} from 'lucide-react'
import { formatPrice } from '@/utils/format'
import { Link } from 'react-router-dom'

export function ManagerReportsPage() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' && user.branchId > 0 ? user.branchId : undefined
  const { data: reports, isLoading, isError, error, refetch } = useBranchReports(branchId)

  const chartData = (reports?.monthlyRevenue ?? []).map((v, i) => ({
    name: `Kỳ ${i + 1}`,
    value: v,
  }))
  const maxBrandCount = Math.max(...(reports?.salesByBrand ?? []).map((b) => b.count), 1)
  const totalSoldByBrand = (reports?.salesByBrand ?? []).reduce((s, b) => s + b.count, 0)
  const revenuePlaceholderSum = (reports?.monthlyRevenue ?? []).reduce((s, v) => s + v, 0)
  const revenuePlaceholderLabel =
    revenuePlaceholderSum > 0 ? formatPrice(revenuePlaceholderSum) : 'Chưa có dữ liệu'

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link to="/manager/dashboard" className="transition-colors hover:text-[#1A3C6E]">Quản lý</Link>
          <span>/</span>
          <span className="text-slate-900">Báo Cáo</span>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">Báo Cáo Chi Nhánh</h1>
            <p className="text-slate-500">Dữ liệu từ API /manager/reports</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Calendar className="h-5 w-5 text-[#1A3C6E]" />
              <span className="px-2 text-sm font-bold">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Tải lại
            </button>
            <div className="flex gap-3">
              <button type="button" className="flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-bold text-slate-700">
                <FileSpreadsheet className="h-5 w-5" />
                Excel
              </button>
              <button type="button" className="flex h-10 items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 text-sm font-bold text-white">
                <FileDown className="h-5 w-5" />
                Xuất PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {(error as Error)?.message || 'Không tải được báo cáo.'}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Xe bán (theo hãng)</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C6E]/10">
              <ShoppingCart className="h-5 w-5 text-[#1A3C6E]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? '—' : totalSoldByBrand}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Doanh thu (placeholder)</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C6E]/10">
              <DollarSign className="h-5 w-5 text-[#1A3C6E]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? '—' : revenuePlaceholderLabel}</p>
          <p className="text-xs text-slate-500">Tổng 6 kỳ — placeholder; không hiển thị như số liệu thật khi bằng 0</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Ghi chú</p>
          <p className="text-sm text-slate-600">Biểu đồ và hãng xe lấy từ cơ sở dữ liệu; doanh thu chi tiết bổ sung ở sprint sau.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold">Doanh thu (placeholder)</h3>
          <div className="h-64 min-h-[256px] w-full min-w-0">
            {!isLoading && revenuePlaceholderSum === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Chưa có dữ liệu doanh thu (placeholder toàn 0).
              </div>
            ) : (
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
                  <Area type="monotone" dataKey="value" stroke="#1A3C6E" strokeWidth={2} fill="url(#reportGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold">Xe bán theo hãng</h3>
          <div className="space-y-4">
            {(reports?.salesByBrand ?? []).length === 0 && !isLoading && (
              <p className="text-sm text-slate-500">Chưa có xe đã bán theo hãng trong phạm vi lọc.</p>
            )}
            {(reports?.salesByBrand ?? []).map((item, i) => {
              const pct = Math.min(100, (item.count / maxBrandCount) * 100)
              const opacity = 1 - i * 0.15
              return (
                <div key={item.brand} className="space-y-1">
                  <div className="mb-1 flex justify-between text-sm font-bold">
                    <span>{item.brand}</span>
                    <span>{item.count} xe</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#1A3C6E]" style={{ width: `${pct}%`, opacity }} />
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
            <h3 className="text-lg font-bold">Dòng xe bán nhiều nhất</h3>
            <p className="mt-1 text-sm text-slate-500">Theo phạm vi chi nhánh (hoặc toàn bộ nếu không lọc)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Dòng xe</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Hãng</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Đã bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reports?.topModels ?? []).length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                      Chưa có dòng xe nào có trạng thái Đã bán trong phạm vi lọc.
                    </td>
                  </tr>
                )}
                {(reports?.topModels ?? []).map((v, idx) => (
                  <tr key={`${v.subcategoryId}-${v.modelName}-${idx}`} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-bold">{v.modelName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.brandName}</td>
                    <td className="px-6 py-4 text-sm">{v.soldCount} xe</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold">Hiệu suất nhân viên</h3>
          </div>
          <div className="px-6 py-12 text-center text-sm text-slate-500">Chưa có dữ liệu từ API</div>
        </div>
      </div>
    </div>
  )
}
