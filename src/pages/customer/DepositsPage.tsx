import { Link } from 'react-router-dom'
import { useDeposits } from '@/hooks/useDeposits'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice, formatDate } from '@/utils/format'

const statusMap: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
  Confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-700' },
  Refunded: { label: 'Đã hoàn cọc', className: 'bg-gray-100 text-gray-600' },
  ConvertedToOrder: { label: 'Đã chuyển sang đơn mua', className: 'bg-purple-100 text-purple-700' },
}

export function DepositsPage() {
  const { data: deposits, isLoading } = useDeposits()
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
        <h1 className="text-2xl font-bold text-slate-900">Đặt Cọc</h1>
        <p className="mt-1 text-slate-500">Danh sách các khoản đặt cọc của bạn</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Xe</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Số Tiền Cọc</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày Đặt</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Hạn Hết</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng Thái</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {(deposits ?? []).map((d) => {
              const vehicle = vehicles.find((v) => v.id === d.vehicleId)
              const status = statusMap[d.status] ?? { label: d.status, className: 'bg-gray-100' }
              return (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={vehicle?.images?.[0] ?? 'https://placehold.co/60x40'}
                        alt=""
                        className="h-12 w-16 rounded object-cover"
                      />
                      <span className="font-medium">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Xe'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#E8612A]">
                    {formatPrice(d.amount)}
                  </td>
                  <td className="px-4 py-3">{formatDate(d.depositDate)}</td>
                  <td className="px-4 py-3">{formatDate(d.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.orderId && (
                      <Link
                        to={`/dashboard/orders/${d.orderId}`}
                        className="text-[#1A3C6E] hover:underline"
                      >
                        Xem Đơn Mua
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(deposits ?? []).length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Chưa có đặt cọc nào
        </div>
      )}
    </div>
  )
}
