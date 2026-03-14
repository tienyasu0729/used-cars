import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeposits } from '@/hooks/useDeposits'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice, formatDate } from '@/utils/format'
import { Plus, Building2, CheckCircle, AlertTriangle } from 'lucide-react'

const ACTIVE_STATUSES = ['Confirmed', 'Pending']
const HISTORY_STATUSES = ['Refunded', 'ConvertedToOrder']

function isExpiringSoon(expiryDate: string, withinDays = 3): boolean {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= withinDays
}

function getStatusDisplay(status: string, expiryDate: string) {
  if (status === 'Confirmed' && isExpiringSoon(expiryDate)) {
    return { label: 'Sắp hết hạn', className: 'bg-red-100 text-red-700' }
  }
  const map: Record<string, { label: string; className: string }> = {
    Confirmed: { label: 'Đang giữ chỗ', className: 'bg-green-100 text-green-700' },
    Pending: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-700' },
    Refunded: { label: 'Đã hoàn cọc', className: 'bg-slate-100 text-slate-600' },
    ConvertedToOrder: { label: 'Đã chuyển đơn', className: 'bg-purple-100 text-purple-700' },
  }
  return map[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
}

export function DepositsPage() {
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const { data: deposits, isLoading } = useDeposits()
  const { data: vehiclesData } = useVehicles()
  const vehicles = vehiclesData?.data ?? []

  const activeDeposits = (deposits ?? []).filter((d) => ACTIVE_STATUSES.includes(d.status))
  const historyDeposits = (deposits ?? []).filter((d) => HISTORY_STATUSES.includes(d.status))
  const displayed = tab === 'active' ? activeDeposits : historyDeposits
  const totalAmount = activeDeposits.reduce((s, d) => s + d.amount, 0)
  const successCount = (deposits ?? []).filter((d) => d.status === 'ConvertedToOrder' || d.status === 'Refunded').length

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
        <Link to="/dashboard" className="transition-colors hover:text-[#1A3C6E]">Bảng điều khiển</Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Khoản đặt cọc</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Khoản đặt cọc của tôi</h1>
          <p className="mt-1 text-slate-500">Theo dõi và quản lý các khoản tiền đặt cọc giữ xe của bạn tại Đà Nẵng</p>
        </div>
        <Link
          to="/vehicles"
          className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1A3C6E]/90"
        >
          <Plus className="h-5 w-5" />
          Tìm xe mới
        </Link>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('active')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === 'active'
              ? 'border-b-2 border-[#1A3C6E] bg-[#1A3C6E]/5 text-[#1A3C6E]'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Đang hoạt động ({activeDeposits.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === 'history'
              ? 'border-b-2 border-[#1A3C6E] bg-[#1A3C6E]/5 text-[#1A3C6E]'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Lịch sử giao dịch
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phương tiện</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Số tiền</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày hết hạn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map((d) => {
                const vehicle = vehicles.find((v) => v.id === d.vehicleId)
                const status = getStatusDisplay(d.status, d.expiryDate)
                const txId = d.id.startsWith('DEP-') ? d.id : `DEP-${d.id}`
                return (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 bg-cover bg-center"
                          style={{ backgroundImage: `url(${vehicle?.images?.[0] || 'https://placehold.co/64x48'})` }}
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.trim || ''} ${vehicle.year}`.trim() : 'Xe'}
                          </p>
                          <p className="text-xs text-slate-500">Mã giao dịch: {txId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(d.amount).replace(' VNĐ', ' ₫')}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatDate(d.depositDate)}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatDate(d.expiryDate)}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {d.orderId ? (
                        <Link to={`/dashboard/orders/${d.orderId}`} className="text-sm font-semibold text-[#1A3C6E] hover:underline">
                          Chi tiết
                        </Link>
                      ) : (
                        <Link to={`/vehicles/${d.vehicleId}`} className="text-sm font-semibold text-[#1A3C6E] hover:underline">
                          Chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-500">Hiển thị {displayed.length} trên {displayed.length} kết quả</p>
          <div className="flex gap-2">
            <button className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-400" disabled>Trước</button>
            <button className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-900 transition-colors hover:bg-slate-50">Sau</button>
          </div>
        </div>
      </div>

      {displayed.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Chưa có khoản đặt cọc nào
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[#1A3C6E]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Tổng tiền ký quỹ</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(totalAmount).replace(' VNĐ', ' ₫')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Lượt đặt thành công</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">{successCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Lưu ý quan trọng</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Tiền đặt cọc sẽ được hoàn lại 100% nếu xe không đúng mô tả khi xem trực tiếp.
          </p>
        </div>
      </div>
    </div>
  )
}
