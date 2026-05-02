import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { getPaymentReturnContextForDeposit, getPaymentReturnVehicleIdForDeposit, paymentApi } from '@/services/paymentApi'
import { depositApi } from '@/services/deposit.service'
import { getStoredAuthToken } from '@/utils/authToken'
import { notifyInventoryChanged } from '@/utils/inventorySync'

export function PaymentResultPage() {
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const searchStr = sp.toString()
  const [homeRedirectSec, setHomeRedirectSec] = useState(0)
  const [zaloSyncTimedOut, setZaloSyncTimedOut] = useState(false)
  const [aug, setAug] = useState<{
    success?: boolean
    orderId?: string | null
    depositId?: string | null
  } | null>(null)

  const { success, code, orderId, depositId, kind, zaloStatus, vehicleId, zaloReturnCodeParam } = useMemo(() => {
    const successRaw = sp.get('success')
    const success = successRaw === 'true'
    const code = sp.get('code') ?? ''
    const orderId = sp.get('orderId')
    const depositId = sp.get('depositId')
    const kind = sp.get('kind') ?? ''
    const zaloStatus = sp.get('status')
    const vehicleId = sp.get('vehicleId')
    const zaloReturnCodeParam = sp.get('returncode') ?? sp.get('return_code') ?? ''
    return { success, code, orderId, depositId, kind, zaloStatus, vehicleId, zaloReturnCodeParam }
  }, [sp])

  useEffect(() => {
    setZaloSyncTimedOut(false)
  }, [kind, depositId, orderId])

  const abandonDepositOnceRef = useRef(false)
  const cancelZaloOrderPaymentOnceRef = useRef(false)
  const lastZaloOrderPaymentIdRef = useRef<number | null>(null)

  const abandonAwaitingDeposit = useCallback((reason: string) => {
    if (abandonDepositOnceRef.current) return
    const did = depositId != null ? Number(depositId) : NaN
    if (!Number.isFinite(did) || did <= 0) return
    if (!getStoredAuthToken()) return
    abandonDepositOnceRef.current = true
    void depositApi
      .cancel(did, reason)
      .then(() => notifyInventoryChanged())
      .catch(() => {
        abandonDepositOnceRef.current = false
      })
  }, [depositId])

  useEffect(() => {
    cancelZaloOrderPaymentOnceRef.current = false
    lastZaloOrderPaymentIdRef.current = null
  }, [kind, orderId])

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
    if (kind !== 'zalo_deposit') return
    // Cancel khi returncode=2 HOAC returncode am (vd: -6012 = dang doi soat / that bai)
    const rc = zaloReturnCodeParam !== '' ? Number(zaloReturnCodeParam) : NaN
    if (Number.isNaN(rc)) return
    if (rc !== 2 && rc >= 0) return
    abandonAwaitingDeposit(`ZaloPay returncode=${zaloReturnCodeParam} (tu URL)`)
  }, [kind, zaloReturnCodeParam, abandonAwaitingDeposit])

  useEffect(() => {
    if (kind !== 'zalo_deposit') return
    // status=2, failed, hoac "-" (pending reconciliation) deu la that bai
    if (zaloStatus !== '2' && zaloStatus !== 'failed' && zaloStatus !== '-') return
    abandonAwaitingDeposit(`ZaloPay status=${zaloStatus} (tu URL)`)
  }, [kind, zaloStatus, abandonAwaitingDeposit])

  // Goi 1 lan duy nhat khi mount — query ZaloPay ngay, khong polling
  useEffect(() => {
    if (kind !== 'zalo_deposit') return
    const did = depositId != null ? Number(depositId) : NaN
    if (!Number.isFinite(did) || did <= 0) return

    let cancelled = false
    void paymentApi
      .zaloPayReturn({ depositId: did })
      .then((r) => {
        if (cancelled) return
        if (r.success) {
          setAug({ success: true, depositId: String(did) })
        } else {
          notifyInventoryChanged()
          setAug({ success: false, depositId: String(did) })
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [kind, depositId])

  useEffect(() => {
    if (kind !== 'zalo_order') {
      return
    }
    if (!getStoredAuthToken()) {
      return
    }
    const oid = orderId != null ? Number(orderId) : NaN
    if (Number.isNaN(oid)) {
      return
    }
    let cancelled = false
    const poll = () => {
      void (async () => {
        try {
          const r = await paymentApi.zaloPayStatus({ orderId: oid })
          if (cancelled) return
          if (
            r.localStatus === 'Completed' ||
            r.localStatus === 'Confirmed'
          ) {
            setAug((prev) => ({
              ...prev,
              success: true,
              orderId: String(oid),
            }))
          } else {
            const opidRaw = r.orderPaymentId
            if (typeof opidRaw === 'number' && Number.isFinite(opidRaw) && opidRaw > 0) {
              lastZaloOrderPaymentIdRef.current = opidRaw
            }
            const opidForCancel = lastZaloOrderPaymentIdRef.current
            const gw = r.gateway as Record<string, unknown> | undefined
            const rawRc = gw?.return_code ?? gw?.returncode
            const n = typeof rawRc === 'number' ? rawRc : Number(String(rawRc ?? ''))
            if (
              n === 2 &&
              opidForCancel != null &&
              opidForCancel > 0 &&
              !cancelZaloOrderPaymentOnceRef.current
            ) {
              cancelZaloOrderPaymentOnceRef.current = true
              void paymentApi
                .cancelPendingOrderPayment(opidForCancel)
                .then(() => notifyInventoryChanged())
                .catch(() => {
                  cancelZaloOrderPaymentOnceRef.current = false
                })
            }
          }
        } catch {
          /* ignore */
        }
      })()
    }
    poll()
    const interval = window.setInterval(poll, 4000)
    const stop = window.setTimeout(() => {
      window.clearInterval(interval)
      setZaloSyncTimedOut(true)
    }, 60000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.clearTimeout(stop)
    }
  }, [kind, orderId])

  const isZaloReturn = kind === 'zalo_order' || kind === 'zalo_deposit'
  const canPollZaloStatus = Boolean(getStoredAuthToken())
  const zaloLikelyOk =
    zaloStatus === '1' || zaloStatus === '0' || zaloStatus === '3'
  // ZaloPay tra ve status=- hoac returncode am (vd: -6012) = dang doi soat / that bai
  const zaloReturnCodeNum = zaloReturnCodeParam !== '' ? Number(zaloReturnCodeParam) : NaN
  const zaloKnownFailed =
    zaloStatus === '2' || zaloStatus === 'failed' ||
    zaloStatus === '-' ||
    (!Number.isNaN(zaloReturnCodeNum) && zaloReturnCodeNum < 0)
  const zaloDepositPaymentFailedOrCancelled =
    kind === 'zalo_deposit' &&
    !success &&
    aug?.success !== true &&
    zaloKnownFailed

  const mergedSuccess = success || aug?.success === true
  const mergedOrderId = orderId ?? aug?.orderId ?? null
  const mergedDepositId = depositId ?? aug?.depositId ?? null
  const retryVehicleNumeric = useMemo(() => {
    const q = vehicleId != null && vehicleId !== '' ? Number(vehicleId) : NaN
    if (Number.isFinite(q) && q > 0) return q
    return getPaymentReturnVehicleIdForDeposit(mergedDepositId)
  }, [vehicleId, mergedDepositId])
  const depositReturnContext = useMemo(
    () => getPaymentReturnContextForDeposit(mergedDepositId),
    [mergedDepositId],
  )
  const returnInstallmentVehicleId =
    depositReturnContext?.flow === 'installment_wizard' &&
    typeof depositReturnContext.vehicleId === 'number' &&
    Number.isFinite(depositReturnContext.vehicleId) &&
    depositReturnContext.vehicleId > 0
      ? depositReturnContext.vehicleId
      : null
  const autoRedirectHref =
    returnInstallmentVehicleId != null
      ? `/dashboard/installment/${returnInstallmentVehicleId}`
      : depositReturnContext?.flow === 'installment_status'
        ? '/dashboard/installments'
        : '/'
  const zaloWaitingForSync =
    isZaloReturn &&
    !mergedSuccess &&
    zaloLikelyOk &&
    canPollZaloStatus &&
    !zaloSyncTimedOut
  const hasPaymentOutcome =
    mergedSuccess ||
    code.length > 0 ||
    kind !== '' ||
    mergedOrderId != null ||
    mergedDepositId != null

  useEffect(() => {
    if (kind !== 'zalo_order') return
    if (!zaloSyncTimedOut) return
    if (!getStoredAuthToken()) return
    if (mergedSuccess || aug?.success) return
    const pid = lastZaloOrderPaymentIdRef.current
    if (pid == null || pid <= 0) return
    if (cancelZaloOrderPaymentOnceRef.current) return
    cancelZaloOrderPaymentOnceRef.current = true
    void paymentApi
      .cancelPendingOrderPayment(pid)
      .then(() => notifyInventoryChanged())
      .catch(() => {
        cancelZaloOrderPaymentOnceRef.current = false
      })
  }, [kind, zaloSyncTimedOut, mergedSuccess, aug?.success])

  useEffect(() => {
    if (!mergedSuccess) return
    notifyInventoryChanged()
  }, [mergedSuccess])

  useEffect(() => {
    if (zaloWaitingForSync || !hasPaymentOutcome) {
      setHomeRedirectSec(0)
      return
    }
    setHomeRedirectSec(5)
    let remaining = 5
    const interval = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        window.clearInterval(interval)
        setHomeRedirectSec(0)
        navigate(autoRedirectHref, { replace: true })
      } else {
        setHomeRedirectSec(remaining)
      }
    }, 1000)
    return () => window.clearInterval(interval)
  }, [zaloWaitingForSync, hasPaymentOutcome, navigate, autoRedirectHref])

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
    if (zaloLikelyOk && !canPollZaloStatus) {
      headline = 'Cần đăng nhập'
      body =
        'Để đồng bộ trạng thái thanh toán ZaloPay, vui lòng đăng nhập đúng tài khoản khách đã đặt cọc rồi vào mục Đặt cọc hoặc Đơn hàng.'
      icon = 'fail'
    } else if (zaloLikelyOk && zaloSyncTimedOut) {
      headline = 'Chưa xác nhận tự động'
      body =
        kind === 'zalo_order'
          ? 'Hệ thống không cập nhật kịp trong thời gian chờ. Giao dịch thanh toán chờ có thể đã được đóng — vui lòng mở Đơn hàng để thử lại thanh toán; nếu tiền đã trừ mà chưa thấy cập nhật, hãy liên hệ showroom.'
          : 'Hệ thống không cập nhật kịp trong thời gian chờ. Vui lòng mở mục Đặt cọc hoặc Đơn hàng để xem trạng thái; nếu tiền đã trừ mà chưa thấy cọc, hãy liên hệ showroom.'
      icon = 'fail'
    } else {
      headline = zaloLikelyOk ? 'Đang xác nhận thanh toán' : 'Thanh toán chưa hoàn tất'
      body = zaloLikelyOk
        ? 'ZaloPay đã nhận yêu cầu. Hệ thống có thể cập nhật trong vài giây — vui lòng kiểm tra lại mục Đơn hàng hoặc Đặt cọc.'
        : 'Giao dịch không thành công hoặc đã hủy. Bạn có thể thử lại với phương thức khác.'
      icon = zaloLikelyOk ? 'wait' : 'fail'
    }
  }

  const primaryHref =
    returnInstallmentVehicleId != null
      ? `/dashboard/installment/${returnInstallmentVehicleId}`
      : depositReturnContext?.flow === 'installment_status'
        ? '/dashboard/installments'
        : mergedDepositId != null
          ? '/dashboard/deposits'
          : mergedOrderId != null
            ? '/dashboard/orders'
            : '/dashboard'

  const primaryLabel =
    returnInstallmentVehicleId != null
      ? 'Tiếp tục hồ sơ trả góp'
      : depositReturnContext?.flow === 'installment_status'
        ? 'Hồ sơ trả góp của tôi'
        : mergedDepositId != null
          ? 'Đặt cọc của tôi'
          : mergedOrderId != null
            ? 'Đơn hàng của tôi'
            : 'Bảng điều khiển'

  const retryHref =
    retryVehicleNumeric != null
      ? `/vehicles/${retryVehicleNumeric}`
      : mergedDepositId != null
        ? '/dashboard/deposits'
        : mergedOrderId != null
          ? '/dashboard/orders'
          : '/vehicles'
  const retryLabel = retryVehicleNumeric != null ? 'Đặt lại' : 'Thử lại'

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        {icon === 'ok' && <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.75} />}
        {icon === 'fail' && <XCircle className="h-16 w-16 text-red-500" strokeWidth={1.75} />}
        {icon === 'wait' && <Loader2 className="h-16 w-16 animate-spin text-[#1A3C6E]" strokeWidth={1.75} />}
      </div>
      <h1 className="mb-2 text-2xl font-black text-slate-900">{headline}</h1>
      <p className="mb-6 text-slate-600">{body}</p>
      {!zaloWaitingForSync && hasPaymentOutcome && homeRedirectSec > 0 && (
        <p className="mb-4 text-sm text-slate-500">
          Tự động chuyển về trang chủ sau {homeRedirectSec} giây…
        </p>
      )}
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
            to={retryHref}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {retryLabel}
          </Link>
        )}
        <Link to="/" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
