import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { useStaffOrders } from '@/hooks/useStaffOrders'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice } from '@/utils/format'
import { Badge, Button, Modal, Input } from '@/components/ui'
import { StaffOrderPaymentsPanel } from '@/features/staff/components/StaffOrderPaymentsPanel'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { orderApi } from '@/services/orderApi'
import { notifyInventoryChanged } from '@/utils/inventorySync'
import type { Order } from '@/types'
import type { Vehicle } from '@/types/vehicle.types'

function vehicleThumb(v: Vehicle | null | undefined) {
  const im = v?.images?.[0]
  return typeof im === 'string' ? im : im?.url
}

function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return 'Thao tác thất bại.'
}

function OrderDetailModal({
  order,
  vehicle,
  onClose,
}: {
  order: Order
  vehicle: Vehicle | null
  onClose: () => void
}) {
  const staffRole = useAuthStore((s) => s.user?.role)
  const toast = useToastStore()
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const thumb = vehicleThumb(vehicle)
  const remaining = order.remaining ?? Math.max(0, order.price - order.deposit)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['orders'] })
    qc.invalidateQueries({ queryKey: ['vehicles'] })
    notifyInventoryChanged()
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
      toast.addToast('success', 'Đã cập nhật.')
      invalidate()
    } catch (e) {
      toast.addToast('error', errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  const onAdvance = () => run(() => orderApi.advanceStatus(order.id))
  const onSold = () => run(() => orderApi.confirmSold(order.id))
  const onCancel = () => {
    const r = window.prompt('Lý do hủy đơn?')
    if (r == null) return
    void run(() => orderApi.cancel(order.id, r || undefined))
  }

  const onAddPay = () => {
    const n = Number(payAmount.replace(/\s/g, ''))
    if (!Number.isFinite(n) || n < 1) {
      toast.addToast('error', 'Số tiền không hợp lệ.')
      return
    }
    void run(() => orderApi.addManualPayment(order.id, { amount: n, paymentMethod: payMethod }))
  }

  return (
    <Modal
      isOpen={true}
      title={`Đơn ${order.orderNumber ?? '#' + order.id}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Khách</h3>
          <p className="font-semibold text-slate-900">{order.customerName ?? `ID ${order.customerId}`}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Xe</h3>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded bg-slate-200">
              <img src={thumb || ''} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="font-semibold text-slate-900">{vehicle ? `${vehicle.brand} ${vehicle.model}` : order.vehicleId}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Thanh toán</h3>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-slate-600">Tổng:</span>
              <span className="font-bold">{formatPrice(order.price)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-600">Đã cọc / thanh toán:</span>
              <span className="font-bold text-[#1A3C6E]">{formatPrice(order.deposit)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-600">Còn lại:</span>
              <span className="font-bold">{formatPrice(remaining)}</span>
            </p>
          </div>
          <div className="mt-4">
            <StaffOrderPaymentsPanel orderIdRaw={order.id} staffRole={staffRole} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {order.status === 'Pending' && (
            <Button className="bg-[#1A3C6E]" disabled={busy} onClick={onAdvance}>
              Chuyển sang xử lý
            </Button>
          )}
          {order.status === 'Processing' && (
            <Button className="bg-emerald-700" disabled={busy} onClick={onSold}>
              Xác nhận bán
            </Button>
          )}
          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
            <Button variant="outline" disabled={busy} onClick={onCancel}>
              Hủy đơn
            </Button>
          )}
        </div>
        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-sm font-bold text-slate-800">Thu tiền tay (ghi nhận)</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input label="Số tiền (VNĐ)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="cash">Tiền mặt</option>
              </select>
              <Button type="button" variant="outline" disabled={busy} onClick={onAddPay}>
                Ghi nhận
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export function StaffOrdersPage() {
  const { orders: ordersPath } = useStaffOrManagerBasePath()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data: orders, refetch } = useStaffOrders()
  const { vehicles } = useVehicles()
  const toast = useToastStore()
  const qc = useQueryClient()

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') return <Badge variant="pending">Chờ xử lý</Badge>
    if (status === 'Processing') return <Badge variant="confirmed">Đang xử lý</Badge>
    if (status === 'Completed') return <Badge variant="available">Hoàn thành</Badge>
    return <Badge variant="default">Đã hủy</Badge>
  }

  const quickSold = async (o: Order) => {
    try {
      await orderApi.confirmSold(o.id)
      toast.addToast('success', 'Đã xác nhận bán.')
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      notifyInventoryChanged()
      refetch()
    } catch (e) {
      toast.addToast('error', errMsg(e))
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${ordersPath}/new`}
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
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Giá Trị</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày Tạo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng Thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(orders ?? []).map((o) => {
                const vehicle = vehicles.find((v) => String(v.id) === String(o.vehicleId))
                const rowThumb = vehicleThumb(vehicle)
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1A3C6E]">
                      {o.orderNumber ?? `#${o.id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">{o.customerName ?? `Khách #${o.customerId}`}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded bg-slate-200">
                          <img src={rowThumb || ''} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm font-medium">
                          {vehicle?.brand} {vehicle?.model}
                        </span>
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
                          type="button"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {o.status === 'Processing' && (
                          <button
                            type="button"
                            onClick={() => void quickSold(o)}
                            className="rounded-lg bg-[#1A3C6E]/10 px-3 py-1 text-xs font-bold text-[#1A3C6E]"
                          >
                            Xác nhận bán
                          </button>
                        )}
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
