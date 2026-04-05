import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDeposits } from '@/hooks/useDeposits'
import { depositApi } from '@/services/depositApi'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { notifyInventoryChanged } from '@/utils/inventorySync'
import { formatPrice, formatDateVNCalendar, formatDateTimeVN } from '@/utils/format'
import { Plus, Building2, CheckCircle, AlertTriangle, Copy } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'
import { useToastStore } from '@/store/toastStore'

const ACTIVE_STATUSES = ['Confirmed', 'Pending', 'RefundPending']
const HISTORY_STATUSES = [
  'Refunded',
  'ConvertedToOrder',
  'Expired',
  'Cancelled',
  'RefundFailed',
]

/** Giống cột MÃ GD trên trang lịch sử giao dịch admin (rút gọn, hover xem đủ). */
function shortenReferenceDisplay(s: string, len = 16): string {
  if (!s) return '—'
  if (s.length <= len) return s
  return `${s.slice(0, len)}…`
}

async function copyReferenceCode(text: string, onDone: (msg: 'ok' | 'err') => void) {
  try {
    await navigator.clipboard.writeText(text)
    onDone('ok')
  } catch {
    onDone('err')
  }
}

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
    RefundPending: { label: 'Đang hoàn cọc', className: 'bg-amber-100 text-amber-800' },
    Refunded: { label: 'Đã hoàn cọc', className: 'bg-slate-100 text-slate-600' },
    RefundFailed: { label: 'Hoàn cọc thất bại', className: 'bg-red-100 text-red-700' },
    ConvertedToOrder: { label: 'Đã chuyển đơn', className: 'bg-purple-100 text-purple-700' },
    Expired: { label: 'Hết hạn', className: 'bg-slate-100 text-slate-600' },
    Cancelled: { label: 'Đã hủy', className: 'bg-slate-100 text-slate-500' },
  }
  return map[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
}

export function DepositsPage() {
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [cancelDepositId, setCancelDepositId] = useState<string | null>(null)
  const [cancelConfirmedId, setCancelConfirmedId] = useState<string | null>(null)
  const [cancelConfirmedReason, setCancelConfirmedReason] = useState('')
  const qc = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const { data: depData, isLoading } = useDeposits({ size: 200 })
  const deposits = depData?.deposits ?? []

  const cancelMut = useMutation({
    mutationFn: (id: string) => depositApi.cancel(id, 'Khách hàng hủy trên web'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deposits'] })
      notifyInventoryChanged()
      setCancelDepositId(null)
      addToast('success', 'Đã hủy khoản đặt cọc.')
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Không thể hủy cọc. Vui lòng thử lại.'
      addToast('error', msg)
    },
  })

  const cancelConfirmedMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => depositApi.cancelConfirmed(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deposits'] })
      notifyInventoryChanged()
      setCancelConfirmedId(null)
      setCancelConfirmedReason('')
      addToast(
        'success',
        'Đã hủy đặt cọc. Vui lòng liên hệ showroom để được hoàn tiền nếu có.',
      )
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Không thể gửi yêu cầu hủy. Vui lòng thử lại.'
      addToast('error', msg)
    },
  })

  useEffect(() => {
    if (cancelConfirmedId == null) setCancelConfirmedReason('')
  }, [cancelConfirmedId])

  const activeDeposits = deposits.filter((d) => ACTIVE_STATUSES.includes(d.status))
  const historyDeposits = deposits.filter((d) => HISTORY_STATUSES.includes(d.status))
  const displayed = tab === 'active' ? activeDeposits : historyDeposits
  const totalAmount = activeDeposits.reduce((s, d) => s + d.amount, 0)
  const successCount = deposits.filter((d) => d.status === 'ConvertedToOrder' || d.status === 'Refunded').length

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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ngày đặt / tạo lúc (GMT+7)
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày hết hạn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map((d) => {
                const status = getStatusDisplay(d.status, d.expiryDate)
                const txRef = d.gatewayTxnRef?.trim() ?? ''
                const title = d.vehicleTitle?.trim() || 'Xe'
                const rawImg = d.vehicleImageUrl?.trim()
                const imgSrc = rawImg ? externalImageDisplayUrl(rawImg) : ''
                const createdLine =
                  d.createdAt?.trim()
                    ? formatDateTimeVN(d.createdAt)
                    : d.depositDate?.trim()
                      ? `${formatDateVNCalendar(d.depositDate)} · 00:00:00`
                      : '—'
                return (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt=""
                            className="h-12 w-16 shrink-0 rounded-lg object-cover bg-slate-200"
                          />
                        ) : (
                          <div
                            className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 bg-cover bg-center"
                            style={{ backgroundImage: 'url(https://placehold.co/64x48)' }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{title}</p>
                          <div className="mt-0.5 flex max-w-full flex-wrap items-center gap-1.5">
                            <span className="shrink-0 text-xs text-slate-500">Mã giao dịch:</span>
                            <span
                              className="min-w-0 max-w-[200px] truncate font-mono text-xs text-slate-600 sm:max-w-[260px]"
                              title={txRef || undefined}
                            >
                              {txRef ? shortenReferenceDisplay(txRef, 16) : '—'}
                            </span>
                            {txRef ? (
                              <button
                                type="button"
                                className="inline-flex shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#1A3C6E]"
                                aria-label="Sao chép mã giao dịch"
                                title="Sao chép"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void copyReferenceCode(txRef, (r) => {
                                    if (r === 'ok') addToast('success', 'Đã sao chép mã giao dịch.')
                                    else addToast('error', 'Không sao chép được. Thử chọn và copy thủ công.')
                                  })
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(d.amount).replace(' VNĐ', ' ₫')}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      <p className="font-medium text-slate-800">{formatDateVNCalendar(d.depositDate)}</p>
                      <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">{createdLine}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatDateVNCalendar(d.expiryDate)}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        {d.orderId ? (
                          <Link to={`/dashboard/orders/${d.orderId}`} className="text-sm font-semibold text-[#1A3C6E] hover:underline">
                            Chi tiết
                          </Link>
                        ) : (
                          <Link to={`/vehicles/${d.vehicleId}`} className="text-sm font-semibold text-[#1A3C6E] hover:underline">
                            Chi tiết
                          </Link>
                        )}
                        {d.status === 'Pending' && (
                          <button
                            type="button"
                            disabled={cancelMut.isPending}
                            onClick={() => setCancelDepositId(d.id)}
                            className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            Hủy đặt cọc
                          </button>
                        )}
                        {d.status === 'Confirmed' && (
                          <button
                            type="button"
                            disabled={cancelConfirmedMut.isPending}
                            onClick={() => setCancelConfirmedId(d.id)}
                            className="text-sm font-semibold text-amber-700 hover:underline disabled:opacity-50"
                          >
                            Yêu cầu hủy cọc
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

      <Modal
        isOpen={cancelDepositId != null}
        onClose={() => {
          if (!cancelMut.isPending) setCancelDepositId(null)
        }}
        title="Hủy đặt cọc"
        footer={
          <>
            <Button type="button" variant="outline" disabled={cancelMut.isPending} onClick={() => setCancelDepositId(null)}>
              Đóng
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={cancelMut.isPending}
              loading={cancelMut.isPending}
              onClick={() => {
                if (cancelDepositId) cancelMut.mutate(cancelDepositId)
              }}
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn hủy khoản đặt cọc này? Xe sẽ được mở lại cho khách khác nếu chưa thanh toán xong.
        </p>
      </Modal>

      <Modal
        isOpen={cancelConfirmedId != null}
        onClose={() => {
          if (!cancelConfirmedMut.isPending) setCancelConfirmedId(null)
        }}
        title="Yêu cầu hủy cọc đã xác nhận"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={cancelConfirmedMut.isPending}
              onClick={() => setCancelConfirmedId(null)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={cancelConfirmedMut.isPending || !cancelConfirmedReason.trim()}
              loading={cancelConfirmedMut.isPending}
              onClick={() => {
                if (cancelConfirmedId && cancelConfirmedReason.trim()) {
                  cancelConfirmedMut.mutate({ id: cancelConfirmedId, reason: cancelConfirmedReason.trim() })
                }
              }}
            >
              Gửi yêu cầu hủy
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Cọc đã được xác nhận thanh toán. Vui lòng nhập lý do hủy (bắt buộc). Sau khi hủy, liên hệ showroom để xử lý hoàn tiền nếu có.
        </p>
        <textarea
          value={cancelConfirmedReason}
          onChange={(e) => setCancelConfirmedReason(e.target.value)}
          rows={4}
          placeholder="Ví dụ: Khách đổi ý, không mua xe nữa…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
        />
      </Modal>

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
