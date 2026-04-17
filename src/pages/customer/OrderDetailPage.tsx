import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useOrder } from '@/hooks/useOrders'
import { useVehicle } from '@/hooks/useVehicles'
import { useBranch } from '@/hooks/useBranches'
import { formatPrice, formatMileage } from '@/utils/format'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { getVehicleGallerySpecRows, getVehicleExtraSpecRows } from '@/features/vehicles/vehicleGallerySpecs'
import { Button } from '@/components/ui'
import { DepositWizardModal } from '@/features/vehicles/components/DepositWizardModal'
import { MaintenanceHistoryPublic } from '@/features/vehicles/components/MaintenanceHistoryPublic'
import {
  Info,
  Car,
  CreditCard,
  History,
  Download,
  MessageCircle,
  Check,
  Loader2,
  Clock,
  Mail,
  Phone,
  UserCircle2,
  FileText,
  ExternalLink,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/types/order'
import type { Vehicle } from '@/types/vehicle.types'

const statusLabels: Record<string, string> = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
}

function formatOrderDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/** Chữ cái đại diện cho avatar (ưu tiên tên + họ). */
function staffInitials(name: string) {
  const t = name.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}

function vehiclePrimaryImageUrl(v: Vehicle | null | undefined): string {
  if (!v?.images?.length) return 'https://placehold.co/400x300'
  const sorted = [...v.images].sort((a, b) => {
    if (a.primaryImage && !b.primaryImage) return -1
    if (!a.primaryImage && b.primaryImage) return 1
    return a.sortOrder - b.sortOrder
  })
  return externalImageDisplayUrl(sorted[0].url)
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
    { title: 'Tạo đơn', match: 'Pending' },
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
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(order?.vehicleId)
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
  const remainingPay = order.remaining ?? Math.max(0, order.price - order.deposit)
  const canPayOnline =
    numericOrderId != null && remainingPay > 0 && (order.status === 'Pending' || order.status === 'Processing')

  const gallerySpecRows = vehicle ? getVehicleGallerySpecRows(vehicle) : []
  const extraSpecRows = vehicle ? getVehicleExtraSpecRows(vehicle) : []

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
              Đơn hàng {order.orderNumber ? order.orderNumber : `#${order.id}`}
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
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
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
                style={{
                  backgroundImage: `url(${vehicleLoading ? 'https://placehold.co/400x300' : vehiclePrimaryImageUrl(vehicle)})`,
                }}
              />
              <div className="flex flex-1 flex-col justify-between py-2">
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">
                    {vehicle?.title?.trim() ||
                      (vehicle
                        ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''} ${vehicle.trim ?? ''} ${vehicle.year}`.trim()
                        : vehicleLoading
                          ? 'Đang tải…'
                          : 'Xe')}
                  </h3>
                  {vehicle && (
                    <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Năm SX</p>
                        <p className="font-bold">{vehicle.year}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Số km</p>
                        <p className="font-bold">{formatMileage(vehicle.mileage)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Nhiên liệu</p>
                        <p className="text-sm font-bold">{vehicle.fuel || '—'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Hộp số</p>
                        <p className="text-sm font-bold">{vehicle.transmission || '—'}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Mã đơn / vận đơn</p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Đại lý bàn giao</p>
                    <p className="font-semibold text-slate-900">
                      {order.orderNumber ? order.orderNumber : `#${order.id}`}
                    </p>
                    <p className="font-semibold text-slate-900">{branch?.name ?? order.branchName ?? '-'}</p>
                  </div>
                  {vehicle?.listing_id && (
                    <p className="mt-2 text-xs font-mono text-slate-500">Mã tin: {vehicle.listing_id}</p>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                  <span className="text-slate-500">Tổng thanh toán (đơn)</span>
                  <span className="text-2xl font-black text-[#1A3C6E]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-[#1A3C6E]" />
                <h2 className="text-lg font-bold">Chi tiết thông số xe</h2>
              </div>
              {vehicle && (
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A3C6E] hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem trang xe đầy đủ (ảnh, tư vấn, xe tương tự)
                </Link>
              )}
            </div>
            {vehicleLoading && (
              <div className="p-6 text-sm text-slate-500">Đang tải thông tin xe…</div>
            )}
            {!vehicleLoading && vehicle && (
              <>
                <div className="px-6 py-6">
                  <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
                    {gallerySpecRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between border-b border-[#1A3C6E]/5 py-2"
                      >
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  {extraSpecRows.length > 0 && (
                    <>
                      <h3 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-slate-600">
                        Thông số bổ sung
                      </h3>
                      <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
                        {extraSpecRows.map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between border-b border-[#1A3C6E]/5 py-2"
                          >
                            <span className="text-slate-500">{row.label}</span>
                            <span className="font-semibold">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="border-t border-slate-100 px-6 py-6">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                    <FileText className="h-5 w-5 text-[#1A3C6E]" />
                    Mô tả xe
                  </h3>
                  {vehicle.description?.trim() ? (
                    <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {vehicle.description}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Chưa có mô tả chi tiết.</p>
                  )}
                </div>
                <div className="border-t border-slate-100 px-6 py-6">
                  <MaintenanceHistoryPublic vehicleId={vehicle.id} />
                </div>
              </>
            )}
            {!vehicleLoading && !vehicle && (
              <div className="p-6 text-sm text-slate-600">
                Không tải được thông tin xe.{' '}
                <Link to="/vehicles" className="font-medium text-[#1A3C6E] underline">
                  Xem danh sách xe
                </Link>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <CreditCard className="h-5 w-5 text-[#1A3C6E]" />
              <h2 className="text-lg font-bold">Chi tiết thanh toán</h2>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Giá trị đơn hàng (thỏa thuận)</span>
                <span className="font-semibold">{formatPrice(order.price)}</span>
              </div>
              {vehicle != null && vehicle.price > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Giá niêm yết xe (tham khảo)</span>
                  <span className="font-medium text-slate-700">{formatPrice(vehicle.price)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tiền cọc đã đặt</span>
                <span className="font-semibold">{formatPrice(order.deposit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Còn lại cần thanh toán</span>
                <span className="font-semibold text-[#E8612A]">{formatPrice(remainingPay)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Số tiền trên đơn do showroom ghi nhận khi tạo đơn; giá niêm yết có thể thay đổi theo thời điểm.
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
              {(order.staffName ||
                order.branchName ||
                order.staffEmail ||
                order.staffPhone) && (
                <div className="mt-10 rounded-lg border border-[#1A3C6E]/10 bg-[#1A3C6E]/5 p-4">
                  <div className="mb-3 flex items-start gap-2">
                    <UserCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1A3C6E]" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1A3C6E]">
                        Nhân viên tạo đơn (showroom)
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Người đã lập đơn mua xe này thuộc chi nhánh phụ trách đơn — bạn có thể liên hệ trực tiếp khi cần.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/15 text-sm font-bold text-[#1A3C6E]">
                      {order.staffName ? staffInitials(order.staffName) : '?'}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Họ tên nhân viên</p>
                        <p className="font-bold text-slate-900">{order.staffName?.trim() || 'Chưa ghi nhận trên hệ thống'}</p>
                      </div>
                      {order.branchName && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Chi nhánh của đơn hàng
                          </p>
                          <p className="font-medium text-slate-800">{order.branchName}</p>
                        </div>
                      )}
                      {order.staffEmail && (
                        <a
                          href={`mailto:${order.staffEmail}`}
                          className="flex items-center gap-2 break-all text-[#1A3C6E] hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {order.staffEmail}
                        </a>
                      )}
                      {order.staffPhone && (
                        <a
                          href={`tel:${order.staffPhone.replace(/\s/g, '')}`}
                          className="flex items-center gap-2 text-[#1A3C6E] hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {order.staffPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
            vehicle?.title?.trim() ||
            (vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.trim ?? ''} ${vehicle.year}`.trim() : undefined)
          }
          orderTotalPrice={order.price}
          listingPrice={vehicle?.price}
          depositAmount={order.deposit}
          remainingAmount={remainingPay}
          vehicleDetailTo={order.vehicleId ? `/vehicles/${order.vehicleId}` : undefined}
          orderDisplayCode={order.orderNumber ? order.orderNumber : `#${order.id}`}
          orderPreferredPaymentMethod={order.paymentMethod}
          uiOnly={false}
          orderId={numericOrderId}
          defaultAmount={remainingPay}
        />
      )}
    </div>
  )
}
