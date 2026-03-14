import { Link } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice, formatDate } from '@/utils/format'

const statusMap: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Chờ Xác Nhận', className: 'bg-yellow-100 text-yellow-700' },
  Confirmed: { label: 'Đã Xác Nhận', className: 'bg-blue-100 text-blue-700' },
  Processing: { label: 'Đang Xử Lý', className: 'bg-orange-100 text-orange-700' },
  Completed: { label: 'Hoàn Thành', className: 'bg-green-100 text-green-700' },
  Cancelled: { label: 'Đã Hủy', className: 'bg-gray-100 text-gray-600' },
}

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const { data: vehiclesData } = useVehicles()
  const vehicles = vehiclesData?.data ?? []

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đơn Mua</h1>
        <p className="mt-1 text-slate-500">Lịch sử đơn hàng của bạn</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã Đơn</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Xe</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Giá</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày Tạo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng Thái</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => {
              const vehicle = vehicles.find((v) => v.id === o.vehicleId)
              const status = statusMap[o.status] ?? { label: o.status, className: 'bg-gray-100' }
              return (
                <tr key={o.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{o.id}</td>
                  <td className="px-4 py-3">
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Xe'}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#E8612A]">
                    {formatPrice(o.price)}
                  </td>
                  <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/orders/${o.id}`}
                      className="text-[#1A3C6E] hover:underline"
                    >
                      Xem Chi Tiết
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(orders ?? []).length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Chưa có đơn hàng nào
        </div>
      )}
    </div>
  )
}
