import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Car, Package, TrendingUp, Calendar, Download, CalendarDays } from 'lucide-react'
import { downloadExcel, todayStr } from '@/utils/excelExport'
import { useManagerDashboardStats } from '@/hooks/useManagerDashboardStats'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useBranchReports } from '@/hooks/useBranchReports'
import { useAuthStore } from '@/store/authStore'

const MONTH_SHORT = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

function formatVnd(n: number): string {
  return `${n.toLocaleString('vi-VN')} ₫`
}

function parseTopStaff(raw: unknown[] | undefined): { name: string; role: string; cars: number; revLabel: string }[] {
  if (!raw?.length) return []
  return raw.map((item) => {
    if (typeof item !== 'object' || item === null) {
      return { name: '—', role: '', cars: 0, revLabel: '—' }
    }
    const o = item as Record<string, unknown>
    const name = String(o.staffName ?? o.name ?? 'Nhân viên')
    const role = String(o.role ?? 'Tư vấn')
    const cars =
      typeof o.salesCount === 'number' ? o.salesCount : Number(o.vehiclesSold ?? o.cars ?? 0) || 0
    const rev = typeof o.revenue === 'number' ? o.revenue : Number(o.revenueVnd) || 0
    return { name, role, cars, revLabel: formatVnd(rev) }
  })
}

export function ManagerDashboardPage() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' && user.branchId > 0 ? user.branchId : undefined
  const { data: apiStats, isPending: statsPending } = useManagerDashboardStats()
  const { data: reports } = useBranchReports(branchId)

  const brandData = reports?.salesByBrand ?? []
  const revenueSeries = (reports?.monthlyRevenue ?? []).map((value, i) => ({
    name: MONTH_SHORT[i] ?? `${i + 1}`,
    value,
  }))
  const topStaffRows = parseTopStaff(apiStats?.topStaff as unknown[] | undefined)

  const revNum = apiStats?.monthlyRevenue != null ? Number(apiStats.monthlyRevenue) : 0
  const soldNum = apiStats?.vehiclesSold ?? 0
  /** Placeholder Tier 4 — không hiển thị 0 ₫ / 0 xe như số liệu thật */
  const revenueDisplay = statsPending ? '—' : revNum > 0 ? formatVnd(revNum) : '—'
  const soldDisplay = statsPending ? '—' : soldNum > 0 ? soldNum : '—'

  const kpis: {
    icon: LucideIcon
    label: string
    value: string | number
    to: string
    ariaLabel: string
    placeholderHint?: string
  }[] = [
    {
      icon: TrendingUp,
      label: 'Doanh thu tháng',
      value: revenueDisplay,
      to: '/manager/reports',
      ariaLabel: 'Doanh thu tháng từ API quản lý',
      placeholderHint:
        !statsPending && revenueDisplay === '—' ? 'Chưa có dữ liệu — báo cáo doanh thu (Tier 4)' : undefined,
    },
    {
      icon: Car,
      label: 'Xe đã bán',
      value: soldDisplay,
      to: '/manager/reports',
      ariaLabel: 'Số xe đã bán',
      placeholderHint:
        !statsPending && soldDisplay === '—' ? 'Chưa có dữ liệu — thống kê bán (Tier 4)' : undefined,
    },
    {
      icon: Package,
      label: 'Tổng tồn kho',
      value: statsPending ? '—' : (apiStats?.totalInventory ?? 0),
      to: '/manager/vehicles',
      ariaLabel: 'Tổng xe tại chi nhánh',
    },
    {
      icon: Calendar,
      label: 'Lịch hẹn 7 ngày tới',
      value: statsPending ? '—' : (apiStats?.weeklyAppointments ?? 0),
      to: '/manager/appointments',
      ariaLabel: 'Số lịch hẹn trong tuần',
    },
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
          <button
            onClick={() => {
              const headers = ['Chỉ số', 'Giá trị']
              const rows: string[][] = [
                ['Doanh thu tháng', revNum > 0 ? `${revNum}` : '0'],
                ['Xe đã bán', String(soldNum)],
                ['Tổng tồn kho', String(apiStats?.totalInventory ?? 0)],
                ['Lịch hẹn 7 ngày tới', String(apiStats?.weeklyAppointments ?? 0)],
              ]
              if (topStaffRows.length > 0) {
                rows.push([])
                rows.push(['--- Top nhân viên ---', ''])
                rows.push(['Tên', 'Số xe bán'])
                for (const s of topStaffRows) {
                  rows.push([s.name, String(s.cars)])
                }
              }
              downloadExcel(`dashboard-${todayStr()}.xlsx`, headers, rows)
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
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
          <Link
            key={kpi.label}
            to={kpi.to}
            aria-label={kpi.ariaLabel}
            className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#1A3C6E]/35 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A3C6E]"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                {kpi.label}
              </p>
              <kpi.icon className="h-5 w-5 shrink-0 text-[#1A3C6E]" aria-hidden />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
            {kpi.placeholderHint && (
              <p className="mt-2 text-xs font-medium text-slate-500">{kpi.placeholderHint}</p>
            )}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Doanh Số Theo Tháng</h4>
                <p className="text-sm text-slate-500">Dữ liệu từ API báo cáo (khi có chuỗi tháng)</p>
              </div>
              <select className="rounded-lg border-slate-200 text-sm focus:ring-[#1A3C6E]/20" disabled aria-disabled>
                <option>6 Tháng Gần Nhất</option>
              </select>
            </div>
            <div className="h-[280px] min-h-[280px] w-full min-w-0">
              {revenueSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries}>
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
              ) : (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
                  <p className="font-medium text-slate-700">Chưa có chuỗi doanh thu theo tháng</p>
                  <p className="mt-1 max-w-md">
                    KPI doanh thu tháng hiện tại hiển thị ở thẻ phía trên. Biểu đồ sẽ hiển thị khi backend cung cấp
                    mảng doanh thu theo tháng.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h4 className="text-lg font-bold text-slate-900">Xe Bán Theo Hãng</h4>
              <p className="text-sm text-slate-500">Dữ liệu từ API báo cáo chi nhánh</p>
            </div>
            {brandData.length > 0 ? (
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
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                Chưa có phân bổ theo hãng — chờ API báo cáo hoặc nhập liệu bán hàng.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-6 text-lg font-bold text-slate-900">Hoạt Động Gần Đây</h4>
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
              Chưa có luồng hoạt động từ API. Sẽ hiển thị khi có endpoint nhật ký / feed chi nhánh.
            </p>
            <Link
              to="/manager/appointments"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#1A3C6E]/5 py-2 text-sm font-bold text-[#1A3C6E] transition-colors hover:bg-[#1A3C6E]/10"
            >
              Xem lịch hẹn
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-6 text-lg font-bold text-slate-900">Nhân Viên Xuất Sắc (Tháng Này)</h4>
            {topStaffRows.length > 0 ? (
              <div className="space-y-4">
                {topStaffRows.map((s) => (
                  <div key={s.name + s.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{s.cars} xe</p>
                      <p className="text-[10px] font-bold uppercase text-emerald-600">{s.revLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                Chưa có bảng xếp hạng từ API (topStaff). Backend có thể bổ sung sau.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
