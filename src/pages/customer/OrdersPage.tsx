import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice, formatDate, formatMileage } from '@/utils/format'
import { Button } from '@/components/ui'
import { Download, Plus, MoreVertical } from 'lucide-react'

const statusMap: Record<string, { label: string; className: string }> = {
  Completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
  Processing: { label: 'Đang xử lý', className: 'bg-amber-100 text-amber-700' },
  Confirmed: { label: 'Chờ thanh toán', className: 'bg-blue-100 text-blue-700' },
  Pending: { label: 'Chờ thanh toán', className: 'bg-blue-100 text-blue-700' },
  Cancelled: { label: 'Đã hủy', className: 'bg-slate-100 text-slate-700' },
}

const tabFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Processing', label: 'Đang xử lý' },
  { key: 'Confirmed', label: 'Chờ thanh toán' },
  { key: 'Completed', label: 'Đã hoàn thành' },
  { key: 'Cancelled', label: 'Đã hủy' },
]

const PAGE_SIZE = 4

export function OrdersPage() {
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const { data: orders, isLoading } = useOrders()
  const { vehicles } = useVehicles()

  const filtered =
    tab === 'all'
      ? orders ?? []
      : (orders ?? []).filter((o) => o.status === tab)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const paginated = filtered.slice(start, start + PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition-colors hover:text-[#1A3C6E]">Trang chủ</Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Đơn hàng của tôi</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Đơn hàng của tôi</h1>
          <p className="mt-1 text-slate-500">Theo dõi trạng thái và lịch sử giao dịch xe của bạn tại Đà Nẵng</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Xuất dữ liệu
          </Button>
          <Link
            to="/vehicles"
            className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1A3C6E]/90"
          >
            <Plus className="h-5 w-5" />
            Mua xe mới
          </Link>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {tabFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setTab(f.key); setPage(1) }}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                tab === f.key
                  ? 'border-[#1A3C6E] text-[#1A3C6E]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.key === 'all' ? `Tất cả (${orders?.length ?? 0})` : f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phương tiện</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Giá bán</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginated.map((o) => {
                const vehicle = vehicles.find((v) => v.id === o.vehicleId)
                const status = statusMap[o.status] ?? { label: o.status, className: 'bg-slate-100 text-slate-700' }
                const detail = vehicle
                  ? `Đời ${vehicle.year} • ${vehicle.exteriorColor ?? '-'} • ${vehicle.mileage != null && vehicle.mileage === 0 ? 'Mới 100%' : formatMileage(vehicle.mileage)}`
                  : '-'
                return (
                  <tr key={o.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">#{o.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 bg-cover bg-center"
                          style={{ backgroundImage: `url(${vehicle?.images?.[0] || 'https://placehold.co/96x96'})` }}
                        />
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-900">
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Xe'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[#1A3C6E]">
                        {formatPrice(o.price).replace(' VNĐ', '₫')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(o.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/orders/${o.id}`}
                        className="inline-flex text-slate-400 transition-colors hover:text-[#1A3C6E]"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-bold">{total ? start + 1 : 0} - {Math.min(start + PAGE_SIZE, total)}</span> trong <span className="font-bold">{total}</span> đơn hàng
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                  page === p ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {total === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Chưa có đơn hàng nào
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1A3C6E] to-blue-900">
        <div className="relative flex flex-col gap-6 px-8 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-white">Đặc quyền bảo hiểm cho đơn hàng tiếp theo</h3>
            <p className="mt-2 max-w-lg text-blue-100/80">
              Giảm ngay 10% phí bảo hiểm vật chất xe cho tất cả khách hàng đã hoàn thành tối thiểu 1 giao dịch tại BanXeOTo Da Nang.
            </p>
          </div>
          <button className="shrink-0 rounded-lg bg-white px-6 py-3 font-bold text-[#1A3C6E] transition-colors hover:bg-slate-100">
            Xem chi tiết ưu đãi
          </button>
        </div>
      </div>
    </div>
  )
}
