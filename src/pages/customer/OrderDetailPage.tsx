import { useParams, Link } from 'react-router-dom'
import { useOrder } from '@/hooks/useOrders'
import { useVehicle } from '@/hooks/useVehicles'
import { formatPrice, formatDate } from '@/utils/format'
import { Button } from '@/components/ui'

export function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading } = useOrder(id)
  const vehicle = useVehicle(order?.vehicleId).data

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    Pending: 'Chờ Xác Nhận',
    Confirmed: 'Đã Xác Nhận',
    Processing: 'Đang Xử Lý',
    Completed: 'Hoàn Thành',
    Cancelled: 'Đã Hủy',
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Chi Tiết Đơn Hàng</h1>
        <Link to="/dashboard/orders">
          <Button variant="outline">← Quay lại</Button>
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm text-slate-500">Mã đơn</p>
            <p className="font-bold text-slate-900">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Ngày tạo</p>
            <p className="font-bold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Trạng thái</p>
            <p className="font-bold text-[#1A3C6E]">{statusLabels[order.status] ?? order.status}</p>
          </div>
        </div>
        {vehicle && (
          <div className="mb-6 flex gap-4">
            <img
              src={vehicle.images?.[0] ?? 'https://placehold.co/200x150'}
              alt=""
              className="h-32 w-48 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h3>
              <p className="mt-2 text-2xl font-bold text-[#E8612A]">{formatPrice(vehicle.price)}</p>
            </div>
          </div>
        )}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 font-semibold text-slate-900">Thanh toán</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Giá xe</span>
              <span>{formatPrice(order.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tiền cọc đã đặt</span>
              <span>{formatPrice(order.deposit)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Còn lại</span>
              <span className="text-[#E8612A]">{formatPrice(order.price - order.deposit)}</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button variant="outline">Tải Hóa Đơn PDF</Button>
        </div>
      </div>
    </div>
  )
}
