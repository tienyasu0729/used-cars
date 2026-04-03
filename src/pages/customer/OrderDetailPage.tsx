import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useOrder } from '@/hooks/useOrders'
import { useVehicle } from '@/hooks/useVehicles'
import { useBranch } from '@/hooks/useBranches'
import { formatPrice } from '@/utils/format'
import { Button } from '@/components/ui'
import { DepositWizardModal } from '@/features/vehicles/components/DepositWizardModal'
import {
  Info,
  Car,
  CreditCard,
  History,
  Download,
  MessageCircle,
  Cog,
  Palette,
  Sofa,
  Calendar,
  Check,
  Loader2,
  Clock,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/types/order'

const statusLabels: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Processing: 'Đang xử lý',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
}

function formatOrderDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

type TimelineStep = { id: string; title: string; date?: string; desc?: string; status: 'done' | 'current' | 'pending' }

function buildOrderTimeline(order: Order): TimelineStep[] {
  const created = formatOrderDate(order.createdAt)
  if (order.status === 'Cancelled') {
    return [
      { id: '1', title: 'Đặt hàng', date: created, status: 'done' },
      { id: '2', title: 'Đã hủy', desc: 'Đơn không còn hiệu lực', status: 'current' },
    ]
  }
  const flow: { title: string; match: OrderStatus }[] = [
    { title: 'Đặt hàng', match: 'Pending' },
    { title: 'Xác nhận đơn', match: 'Confirmed' },
    { title: 'Đang xử lý', match: 'Processing' },
    { title: 'Hoàn tất', match: 'Completed' },
  ]
  const currentIndex = flow.findIndex((s) => s.match === order.status)
  const idx = currentIndex >= 0 ? currentIndex : 0
  return flow.map((step, i) => {
    let status: TimelineStep['status']
    if (i < idx) status = 'done'
    else if (i === idx) status = 'current'
    else status = 'pending'
    return {
      id: String(i + 1),
      title: step.title,
      date: i === 0 ? created : undefined,
      status,
    }
  })
}

export function OrderDetailPage() {
  const { id } = useParams()
  const [payOpen, setPayOpen] = useState(false)
  const { data: order, isLoading } = useOrder(id)
  const { data: vehicle } = useVehicle(order?.vehicleId)
  const { data: branch } = useBranch(vehicle?.branch_id != null ? String(vehicle.branch_id) : undefined)
  const timeline = order ? buildOrderTimeline(order) : []

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  const total = order.price
  const numericOrderId = /^\d+$/.test(order.id) ? Number(order.id) : undefined
  const canPayOnline = numericOrderId != null && order.status === 'Pending'

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link to="/" className="font-medium text-slate-500 hover:text-[#1A3C6E]">Trang chủ</Link>
        <span className="text-slate-400">/</span>
        <Link to="/dashboard" className="font-medium text-slate-500 hover:text-[#1A3C6E]">Bảng điều khiển</Link>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-[#1A3C6E]">Chi tiết đơn hàng</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
              Đơn hàng #{order.id.replace('ORD-', 'BX-')}
            </h1>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="text-slate-500">Ngày đặt: {formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canPayOnline && (
            <Button variant="primary" className="flex items-center gap-2" onClick={() => setPayOpen(true)}>
              <CreditCard className="h-5 w-5" />
              Thanh toán online
            </Button>
          )}
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Tải hóa đơn
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Liên hệ hỗ trợ
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <Info className="h-5 w-5 text-[#1A3C6E]" />
              <h2 className="text-lg font-bold">Thông tin tóm tắt</h2>
            </div>
            <div className="flex flex-col gap-6 p-6 md:flex-row">
              <div
                className="aspect-[4/3] w-full rounded-lg bg-slate-100 bg-cover bg-center md:w-1/3"
                style={{ backgroundImage: `url(${vehicle?.images?.[0] || 'https://placehold.co/400x300'})` }}
              />
              <div className="flex flex-1 flex-col justify-between py-2">
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">
                    {vehicle?.brand} {vehicle?.model} {vehicle?.trim || ''} {vehicle?.year}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Mã vận đơn</p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Đại lý bàn giao</p>
                    <p className="font-semibold text-slate-900">-</p>
                    <p className="font-semibold text-slate-900">{branch?.name ?? '-'}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                  <span className="text-slate-500">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-[#1A3C6E]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <Car className="h-5 w-5 text-[#1A3C6E]" />
              <h2 className="text-lg font-bold">Chi tiết thông số xe</h2>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              {[
                { icon: Cog, label: 'Động cơ', value: vehicle?.engine ?? '-' },
                { icon: Palette, label: 'Màu ngoại thất', value: vehicle?.exteriorColor ?? '-' },
                { icon: Sofa, label: 'Nội thất', value: vehicle?.interiorColor ?? '-' },
                { icon: Calendar, label: 'Năm sản xuất', value: vehicle ? String(vehicle.year) : '-' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10">
                    <s.icon className="h-5 w-5 text-[#1A3C6E]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
                    <p className="text-sm font-bold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <CreditCard className="h-5 w-5 text-[#1A3C6E]" />
              <h2 className="text-lg font-bold">Chi tiết thanh toán</h2>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Giá xe</span>
                <span className="font-semibold">{formatPrice(order.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tiền cọc đã đặt</span>
                <span className="font-semibold">{formatPrice(order.deposit)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Chi tiết thuế, phí và khuyến mãi sẽ hiển thị khi API đơn hàng trả đủ trường.
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-black text-[#1A3C6E]">{formatPrice(total)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="sticky top-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <History className="h-5 w-5 text-[#1A3C6E]" />
              <h2 className="text-lg font-bold">Trạng thái đơn hàng</h2>
            </div>
            <div className="relative p-6">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />
              <div className="relative space-y-8">
                {timeline.map((step) => (
                  <div key={step.id} className="relative flex gap-4">
                    <div
                      className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                        step.status === 'done' ? 'bg-green-500 text-white' : step.status === 'current' ? 'bg-[#1A3C6E] text-white ring-[#1A3C6E]/20' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {step.status === 'done' && <Check className="h-5 w-5" />}
                      {step.status === 'current' && <Loader2 className="h-5 w-5 animate-spin" />}
                      {step.status === 'pending' && <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${step.status === 'current' ? 'text-[#1A3C6E]' : step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                        {step.title}
                      </p>
                      {step.date && <p className="text-xs text-slate-500">{step.date}</p>}
                      {step.desc && <p className="mt-1 text-xs text-slate-600">{step.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 rounded-lg border border-[#1A3C6E]/10 bg-[#1A3C6E]/5 p-4">
                <p className="mb-2 text-xs font-bold uppercase text-[#1A3C6E]">Thông tin liên hệ sale</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div>
                    <p className="text-sm font-bold">Nhân viên phụ trách</p>
                    <p className="text-xs text-slate-500">Chưa có từ API</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {canPayOnline && numericOrderId != null && (
        <DepositWizardModal
          isOpen={payOpen}
          onClose={() => setPayOpen(false)}
          vehicleId={order.vehicleId}
          vehicleName={
            vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.trim ?? ''} ${vehicle.year}`.trim() : undefined
          }
          vehiclePrice={vehicle?.price}
          uiOnly={false}
          orderId={numericOrderId}
          defaultAmount={order.deposit}
        />
      )}
    </div>
  )
}
