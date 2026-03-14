import { Link } from 'react-router-dom'
import { useStaffOrders } from '@/hooks/useStaffOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice } from '@/utils/format'
import { Badge } from '@/components/ui'

export function StaffOrdersPage() {
  const { data: orders } = useStaffOrders()
  const { data: vehiclesData } = useVehicles()
  const vehicles = vehiclesData?.data ?? []

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') return <Badge variant="pending">Chờ xác nhận</Badge>
    if (status === 'Confirmed') return <Badge variant="confirmed">Đã cọc</Badge>
    if (status === 'Processing') return <Badge variant="confirmed">Đang xử lý</Badge>
    if (status === 'Completed') return <Badge variant="available">Hoàn thành</Badge>
    return <Badge variant="default">Đã hủy</Badge>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/staff/orders/new"
        className="inline-flex items-center gap-2 rounded-xl bg-[#1A3C6E] px-5 py-2.5 font-bold text-white shadow-lg hover:bg-[#152d52]"
      >
        Tạo đơn hàng mới
      </Link>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã Đơn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khách Hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Xe</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Giá Trị</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày Tạo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng Thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(orders ?? []).map((o) => {
                const vehicle = vehicles.find((v) => v.id === o.vehicleId)
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1A3C6E]">#{o.id}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">Khách #{o.customerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded bg-slate-200">
                          <img src={vehicle?.images?.[0]} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm font-medium">{vehicle?.brand} {vehicle?.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold">{formatPrice(o.price)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg bg-[#1A3C6E]/10 px-3 py-1 text-xs font-bold text-[#1A3C6E]">
                        Xác nhận bán
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
