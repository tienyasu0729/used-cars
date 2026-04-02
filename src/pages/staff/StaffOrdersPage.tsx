import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { useStaffOrders } from '@/hooks/useStaffOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice } from '@/utils/format'
import { Badge, Button, Modal } from '@/components/ui'
import { customerDisplayLabel } from '@/lib/customerDisplay'
import type { Order } from '@/types'
import type { Vehicle } from '@/types/vehicle.types'

function vehicleThumb(v: Vehicle | null | undefined) {
  const im = v?.images?.[0]
  return typeof im === 'string' ? im : im?.url
}

function OrderDetailModal({ order, vehicle, onClose }: { order: Order; vehicle: Vehicle | null; onClose: () => void }) {
  const cid = Number(order.customerId)
  const customerName = customerDisplayLabel(Number.isFinite(cid) ? cid : undefined)
  const paidAmount = order.deposit
  const remaining = order.price - order.deposit
  const thumb = vehicleThumb(vehicle)

  return (
    <Modal
      isOpen={true}
      title={`Chi tiết đơn #${order.id}`}
      onClose={onClose}
      footer={
        <Button variant="primary" className="bg-[#1A3C6E]">
          Xác nhận bán
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Thông tin người mua</h3>
          <p className="font-semibold text-slate-900">{customerName}</p>
          <p className="text-sm text-slate-600">Email: chưa có từ API</p>
          <p className="text-sm text-slate-600">SĐT: chưa có từ API</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Thông tin xe</h3>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded bg-slate-200">
              <img src={thumb || ''} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="font-semibold text-slate-900">{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Thanh toán</h3>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="font-bold">{formatPrice(order.price)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-600">Đã đặt cọc / thanh toán:</span>
              <span className="font-bold text-[#1A3C6E]">{formatPrice(paidAmount)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-600">Còn lại:</span>
              <span className="font-bold">{formatPrice(remaining)}</span>
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Ngày mua</h3>
          <p className="font-semibold text-slate-900">
            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </Modal>
  )
}

export function StaffOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data: orders } = useStaffOrders()
  const { vehicles } = useVehicles()

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
                const vehicle = vehicles.find((v) => String(v.id) === String(o.vehicleId))
                const rowThumb = vehicleThumb(vehicle)
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1A3C6E]">#{o.id}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">Khách #{o.customerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded bg-slate-200">
                          <img src={rowThumb || ''} alt="" className="h-full w-full object-cover" />
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#1A3C6E]"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg bg-[#1A3C6E]/10 px-3 py-1 text-xs font-bold text-[#1A3C6E]">
                          Xác nhận bán
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          vehicle={vehicles.find((v) => String(v.id) === String(selectedOrder.vehicleId)) ?? null}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
