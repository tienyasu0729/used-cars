import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { paymentApi } from '@/services/paymentApi'
import { getStoredAuthToken } from '@/utils/authToken'

export function PaymentResultPage() {
  const [sp] = useSearchParams()
  const searchStr = sp.toString()
  const [aug, setAug] = useState<{
    success?: boolean
    orderId?: string | null
    depositId?: string | null
  } | null>(null)

  const { success, code, orderId, depositId, kind, zaloStatus, vehicleId } = useMemo(() => {
    const successRaw = sp.get('success')
    const success = successRaw === 'true'
    const code = sp.get('code') ?? ''
    const orderId = sp.get('orderId')
    const depositId = sp.get('depositId')
    const kind = sp.get('kind') ?? ''
    const zaloStatus = sp.get('status')
    const vehicleId = sp.get('vehicleId')
    return { success, code, orderId, depositId, kind, zaloStatus, vehicleId }
  }, [sp])

  useEffect(() => {
    const usp = new URLSearchParams(searchStr)
    if (!usp.get('vnp_TxnRef') || usp.has('success')) {
      return
    }
    let cancelled = false
    void paymentApi
      .vnpayReturnClient(usp)
      .then((r) => {
        if (cancelled) return
        setAug({
          success: r.success,
          orderId: r.orderId != null ? String(r.orderId) : null,
          depositId: r.depositId != null ? String(r.depositId) : null,
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [searchStr])

  useEffect(() => {
    if (kind !== 'zalo_order' && kind !== 'zalo_deposit') {
      return
    }
    if (!getStoredAuthToken()) {
      return
    }
    const oid = orderId != null ? Number(orderId) : NaN
    const did = depositId != null ? Number(depositId) : NaN
    if (Number.isNaN(oid) && Number.isNaN(did)) {
      return
    }
    let cancelled = false
    const poll = () => {
      void (async () => {
        try {
          const r = await paymentApi.zaloPayStatus(
            !Number.isNaN(oid) ? { orderId: oid } : { depositId: did },
          )
          if (cancelled) return
          if (r.localStatus === 'Completed' || r.localStatus === 'Confirmed') {
            setAug((prev) => ({
              ...prev,
              success: true,
              orderId: !Number.isNaN(oid) ? String(oid) : prev?.orderId,
              depositId: !Number.isNaN(did) ? String(did) : prev?.depositId,
            }))
          }
        } catch {
          /* ignore */
        }
      })()
    }
    poll()
    const interval = window.setInterval(poll, 4000)
    const stop = window.setTimeout(() => window.clearInterval(interval), 60000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.clearTimeout(stop)
    }
  }, [kind, orderId, depositId])

  const isZaloReturn = kind === 'zalo_order' || kind === 'zalo_deposit'
  const zaloLikelyOk =
    zaloStatus === '1' || zaloStatus === '0' || zaloStatus === '3'
  const zaloDepositPaymentFailedOrCancelled =
    kind === 'zalo_deposit' &&
    !success &&
    aug?.success !== true &&
    (zaloStatus === '2' || zaloStatus === 'failed')

  const mergedSuccess = success || aug?.success === true
  const mergedOrderId = orderId ?? aug?.orderId ?? null
  const mergedDepositId = depositId ?? aug?.depositId ?? null

  let headline = 'Thanh toán chưa hoàn tất'
  let body =
    code ? `Mã trả về: ${code}. Nếu tiền đã trừ, vui lòng chờ xác nhận hoặc liên hệ hỗ trợ.` : 'Vui lòng thử lại hoặc chọn phương thức khác.'
  let icon: 'ok' | 'fail' | 'wait' = 'fail'

  if (mergedSuccess) {
    headline = 'Thanh toán thành công'
    body =
      mergedOrderId != null
        ? 'Đơn hàng đã được cập nhật. Bạn có thể xem chi tiết trong mục đơn hàng.'
        : mergedDepositId != null
          ? 'Đặt cọc đã được xác nhận thanh toán. Xe đang giữ chỗ theo chính sách.'
          : 'Giao dịch đã được ghi nhận.'
    icon = 'ok'
  } else if (zaloDepositPaymentFailedOrCancelled) {
    headline = 'Thanh toán không thành công'
    body =
      'Đơn đặt cọc đã được hủy tự động. Xe có thể đặt lại nếu còn hiển thị trên hệ thống. Không còn khoản cọc chờ thanh toán cho lần thử này.'
    icon = 'fail'
  } else if (isZaloReturn && !mergedSuccess) {
    headline = zaloLikelyOk ? 'Đang xác nhận thanh toán' : 'Thanh toán chưa hoàn tất'
    body = zaloLikelyOk
      ? 'ZaloPay đã nhận yêu cầu. Hệ thống có thể cập nhật trong vài giây — vui lòng kiểm tra lại mục Đơn hàng hoặc Đặt cọc.'
      : 'Giao dịch không thành công hoặc đã hủy. Bạn có thể thử lại với phương thức khác.'
    icon = zaloLikelyOk ? 'wait' : 'fail'
  }

  const primaryHref =
    mergedDepositId != null ? '/dashboard/deposits' : mergedOrderId != null ? '/dashboard/orders' : '/dashboard'

  const primaryLabel =
    mergedDepositId != null ? 'Đặt cọc của tôi' : mergedOrderId != null ? 'Đơn hàng của tôi' : 'Bảng điều khiển'

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        {icon === 'ok' && <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.75} />}
        {icon === 'fail' && <XCircle className="h-16 w-16 text-red-500" strokeWidth={1.75} />}
        {icon === 'wait' && <Loader2 className="h-16 w-16 animate-spin text-[#1A3C6E]" strokeWidth={1.75} />}
      </div>
      <h1 className="mb-2 text-2xl font-black text-slate-900">{headline}</h1>
      <p className="mb-6 text-slate-600">{body}</p>
      {(mergedOrderId != null || mergedDepositId != null) && (
        <p className="mb-6 text-sm text-slate-500">
          {mergedOrderId != null && (
            <>
              Mã đơn: <span className="font-mono font-semibold text-slate-800">{mergedOrderId}</span>
            </>
          )}
          {mergedDepositId != null && (
            <>
              Mã cọc: <span className="font-mono font-semibold text-slate-800">{mergedDepositId}</span>
            </>
          )}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={primaryHref}
          className="rounded-lg bg-[#1A3C6E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1A3C6E]/90"
        >
          {primaryLabel}
        </Link>
        {!mergedSuccess && (
          <Link
            to={
              kind === 'zalo_deposit' && vehicleId
                ? `/vehicles/${vehicleId}`
                : mergedDepositId != null
                  ? '/dashboard/deposits'
                  : mergedOrderId != null
                    ? '/dashboard/orders'
                    : '/vehicles'
            }
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {kind === 'zalo_deposit' && vehicleId ? 'Đặt lại' : 'Thử lại'}
          </Link>
        )}
        <Link to="/" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
