import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { depositApi } from '@/services/depositApi'
import { paymentApi, paymentInitErrorMessage, setPaymentReturnContext } from '@/services/paymentApi'
import { notifyInventoryChanged } from '@/utils/inventorySync'
import { navigateToPaymentUrl } from '@/utils/paymentNavigation'
import { formatPrice } from '@/utils/format'
import { usePaymentDepositMethods } from '@/hooks/usePaymentDepositMethods'

type FormData = {
  amount: number
  paymentMethod: string
}

interface DepositWizardModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string | number
  vehicleName?: string
  /** Giá niêm yết / hiện tại trên catalog (luồng đặt cọc). */
  vehiclePrice?: number
  /** Tổng giá trị đơn hàng đã thỏa thuận (API order) — ưu tiên khi thanh toán đơn. */
  orderTotalPrice?: number
  /** Giá xe đang niêm yết (tham khảo, có thể khác giá trong đơn). */
  listingPrice?: number
  /** Tiền cọc đã ghi nhận trên đơn (nếu có). */
  depositAmount?: number
  /** Số tiền còn phải thanh toán online (theo đơn). */
  remainingAmount?: number
  /** Link tới trang chi tiết xe (ví dụ `/vehicles/123`). */
  vehicleDetailTo?: string
  /** Giống tiêu đề trang đơn (vd. ORD-... hoặc #id) — tránh lệch với mã nội bộ. */
  orderDisplayCode?: string
  /**
   * Hình thức ghi trên đơn khi tạo (cash | vnpay | zalopay).
   * Nếu là vnpay/zalopay — khóa cổng thanh toán trùng đơn, không cho đổi sang cổng khác.
   */
  orderPreferredPaymentMethod?: string
  uiOnly?: boolean
  orderId?: number
  defaultAmount?: number
  onDepositSuccess?: () => void
}

export function DepositWizardModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  vehiclePrice,
  orderTotalPrice,
  listingPrice,
  depositAmount,
  remainingAmount,
  vehicleDetailTo,
  orderDisplayCode,
  orderPreferredPaymentMethod,
  uiOnly = true,
  orderId,
  defaultAmount,
  onDepositSuccess,
}: DepositWizardModalProps) {
  const [step, setStep] = useState(1)
  const [redirecting, setRedirecting] = useState(false)
  const submitLockRef = useRef(false)
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const schema = useMemo(() => {
    return z
      .object({
        amount: z.number().positive('Nhập số tiền hợp lệ'),
        paymentMethod: z.string().min(1, 'Vui lòng chọn phương thức'),
      })
      .superRefine((data, ctx) => {
        if (orderId != null) {
          const a = Math.round(Number(data.amount))
          const dep = depositAmount != null ? Math.round(depositAmount) : null
          const rem = remainingAmount != null ? Math.round(remainingAmount) : null
          const okDep = dep != null && dep > 0 && a === dep
          const okRem = rem != null && rem > 0 && a === rem
          if (!okDep && !okRem) {
            const parts: string[] = []
            if (dep != null && dep > 0) parts.push(formatPrice(dep) + ' (cọc)')
            if (rem != null && rem > 0) parts.push(formatPrice(rem) + ' (còn lại)')
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                parts.length > 0
                  ? `Hệ thống chỉ chấp nhận thanh toán đúng: ${parts.join(' hoặc ')}.`
                  : 'Số tiền không khớp đơn hàng.',
              path: ['amount'],
            })
          }
        } else if (data.amount < 1000000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tối thiểu 1.000.000 ₫',
            path: ['amount'],
          })
        }
      })
  }, [orderId, depositAmount, remainingAmount])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount ?? 10000000,
      paymentMethod: 'vnpay',
    },
  })

  const amount = watch('amount')
  const { data: pmCfg, isLoading: pmLoading } = usePaymentDepositMethods(isOpen && !!user?.id)

  /** Cổng online đã ghi trên đơn (VNPay/ZaloPay) — không cho khách đổi sang cổng khác. */
  const lockedOrderGateway = useMemo(() => {
    if (orderId == null) return null
    const pm = orderPreferredPaymentMethod?.trim().toLowerCase()
    if (pm === 'vnpay' || pm === 'zalopay') return pm
    return null
  }, [orderId, orderPreferredPaymentMethod])

  /** Đặt cọc qua website: chỉ VNPay / ZaloPay theo cấu hình (không tiền mặt). */
  const onlineMethodOptions = useMemo(() => {
    if (!pmCfg) return [] as { value: string; label: string }[]
    const o: { value: string; label: string }[] = []
    if (pmCfg.vnpay) o.push({ value: 'vnpay', label: 'VNPay' })
    if (pmCfg.zalopay) o.push({ value: 'zalopay', label: 'ZaloPay' })
    return o
  }, [pmCfg])

  const lockedGatewayAvailable =
    lockedOrderGateway != null && onlineMethodOptions.some((o) => o.value === lockedOrderGateway)

  useEffect(() => {
    if (isOpen) {
      setRedirecting(false)
      submitLockRef.current = false
    } else {
      setStep(1)
      setRedirecting(false)
      submitLockRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const first = onlineMethodOptions[0]?.value ?? 'vnpay'
    const method = lockedOrderGateway != null ? lockedOrderGateway : first
    reset({
      amount: defaultAmount ?? 10000000,
      paymentMethod: method,
    })
  }, [isOpen, defaultAmount, reset, onlineMethodOptions, lockedOrderGateway])

  /** Giữ đúng cổng theo đơn khi đã khóa (bước 3 không còn radio). */
  useEffect(() => {
    if (!isOpen || step !== 3 || lockedOrderGateway == null) return
    setValue('paymentMethod', lockedOrderGateway)
  }, [isOpen, step, lockedOrderGateway, setValue])

  const agreedOrderTotal = orderTotalPrice ?? vehiclePrice
  const showListing = listingPrice != null && listingPrice > 0
  const listingDiffers =
    showListing && agreedOrderTotal != null && Math.round(agreedOrderTotal) !== Math.round(listingPrice)
  const orderRefLabel =
    orderDisplayCode?.trim() || (orderId != null ? `#${orderId}` : '')

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return
    if (submitLockRef.current || redirecting) return

    if (uiOnly) {
      addToast('info', 'Tính năng đặt cọc online đang được phát triển. Vui lòng liên hệ showroom để đặt cọc.')
      onClose()
      return
    }

    const amount = Math.round(Number(data.amount))
    if (!Number.isFinite(amount)) {
      addToast('error', orderId != null ? 'Vui lòng nhập số tiền thanh toán hợp lệ.' : 'Vui lòng nhập số tiền cọc hợp lệ.')
      return
    }

    const isGateway = data.paymentMethod === 'vnpay' || data.paymentMethod === 'zalopay'

    if (orderId != null && isGateway) {
      submitLockRef.current = true
      setRedirecting(true)
      try {
        setPaymentReturnContext({ kind: 'order', id: orderId })
        const url =
          data.paymentMethod === 'vnpay'
            ? await paymentApi.createVnpay(orderId, amount)
            : await paymentApi.createZaloPay(orderId, amount)
        navigateToPaymentUrl(url)
      } catch (e: unknown) {
        submitLockRef.current = false
        setRedirecting(false)
        addToast('error', paymentInitErrorMessage(e))
      }
      return
    }

    if (orderId == null && isGateway) {
      submitLockRef.current = true
      setRedirecting(true)
      try {
        const created = await depositApi.create({
          vehicleId: Number(vehicleId),
          amount,
          paymentMethod: data.paymentMethod,
        })
        const url = created.paymentUrl?.trim()
        if (url) {
          setPaymentReturnContext({ kind: 'deposit', id: created.id, vehicleId: Number(vehicleId) })
          queryClient.invalidateQueries({ queryKey: ['deposits'] })
          notifyInventoryChanged()
          navigateToPaymentUrl(url)
          return
        }
        try {
          await depositApi.cancel(created.id, 'Khong nhan duoc link thanh toan (tu dong huy)')
        } catch {
          void 0
        }
        queryClient.invalidateQueries({ queryKey: ['deposits'] })
        notifyInventoryChanged()
        submitLockRef.current = false
        setRedirecting(false)
        addToast(
          'error',
          'Không nhận được liên kết thanh toán từ máy chủ. Kiểm tra đã bật VNPay/ZaloPay và đủ cấu hình tại /admin/config (Thanh toán).',
        )
      } catch (e: unknown) {
        submitLockRef.current = false
        setRedirecting(false)
        const msg =
          e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
            ? (e as { message: string }).message
            : 'Không thể khởi tạo thanh toán. Vui lòng thử lại.'
        addToast('error', msg)
      }
      return
    }

    try {
      const created = await depositApi.create({
        vehicleId: Number(vehicleId),
        amount,
        paymentMethod: data.paymentMethod,
      })
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      notifyInventoryChanged()
      onDepositSuccess?.()
      addToast('success', `Đặt cọc thành công (mã #${created.id}). Xe chuyển trạng thái giữ chỗ.`)
      onClose()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Không thể đặt cọc. Vui lòng thử lại.'
      addToast('error', msg)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={orderId != null ? 'Thanh Toán Đơn Hàng' : 'Đặt Cọc Giữ Xe'}>
      <div className="mb-4 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              s <= step ? 'bg-[#1A3C6E]' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Xe: <span className="font-semibold text-slate-900">{vehicleName ?? 'N/A'}</span>
          </p>
          {vehicleDetailTo && (
            <Link
              to={vehicleDetailTo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-[#1A3C6E] underline-offset-2 hover:underline"
            >
              Xem chi tiết xe trên showroom (mở tab mới)
            </Link>
          )}
          {orderId != null ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Thanh toán đơn mua online</p>
              {agreedOrderTotal != null && agreedOrderTotal > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Giá trị đơn hàng (thỏa thuận)</span>
                  <span className="font-bold text-[#1A3C6E]">{formatPrice(agreedOrderTotal)}</span>
                </div>
              )}
              {showListing && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Giá niêm yết hiện tại (tham khảo)</span>
                  <span className="font-semibold text-slate-800">{formatPrice(listingPrice!)}</span>
                </div>
              )}
              {listingDiffers && (
                <p className="text-xs text-amber-800">
                  Giá trên đơn có thể khác giá niêm yết do thỏa thuận, khuyến mãi hoặc phụ kiện — lấy theo đơn hàng.
                </p>
              )}
              {depositAmount != null && depositAmount > 0 && (
                <div className="flex justify-between gap-3 border-t border-slate-200 pt-3">
                  <span className="text-slate-600">Đã đặt cọc trước đó</span>
                  <span className="font-semibold text-slate-800">−{formatPrice(depositAmount)}</span>
                </div>
              )}
              {remainingAmount != null && remainingAmount > 0 && (
                <div className="flex justify-between gap-3 border-t border-slate-200 pt-3">
                  <span className="text-slate-600">Cần thanh toán tiếp (ước tính)</span>
                  <span className="font-bold text-[#E8612A]">{formatPrice(remainingAmount)}</span>
                </div>
              )}
              <p className="text-xs text-slate-500">
                {orderRefLabel ? (
                  <>
                    Mã đơn <span className="font-medium text-slate-700">{orderRefLabel}</span>.{' '}
                  </>
                ) : null}
                Số tiền gửi cổng thanh toán phải khớp đúng số cọc hoặc số còn lại theo hệ thống.
              </p>
              {lockedOrderGateway != null && (
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-800">Hình thức thanh toán online theo đơn:</span>{' '}
                  {lockedOrderGateway === 'vnpay' ? 'VNPay' : 'ZaloPay'} (đã chọn khi tạo đơn — không đổi cổng ở bước xác nhận).
                </p>
              )}
            </div>
          ) : (
            <>
              {vehiclePrice != null && vehiclePrice > 0 && (
                <p className="text-sm text-slate-600">
                  Giá niêm yết: <span className="font-bold text-[#E8612A]">{formatPrice(vehiclePrice)}</span>
                </p>
              )}
            </>
          )}
          <Button onClick={() => setStep(2)}>Tiếp tục</Button>
        </div>
      )}
      {step === 2 && (
        <form
          onSubmit={handleSubmit(() => setStep(3))}
          className="space-y-4"
        >
          <Input
            label="Họ tên"
            defaultValue={user?.name}
            readOnly
          />
          <Input
            label={orderId != null ? 'Số tiền thanh toán (VND)' : 'Số tiền cọc (VND)'}
            type="number"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
          />
          {orderId != null && (depositAmount != null || remainingAmount != null) && (
            <p className="text-xs text-slate-500">
              Chỉ được nhập đúng một trong các mức:{' '}
              {depositAmount != null && depositAmount > 0 && <span>{formatPrice(depositAmount)} (cọc)</span>}
              {depositAmount != null && depositAmount > 0 && remainingAmount != null && remainingAmount > 0 && ' hoặc '}
              {remainingAmount != null && remainingAmount > 0 && <span>{formatPrice(remainingAmount)} (còn lại)</span>}.
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button type="submit">Tiếp tục</Button>
          </div>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Phương thức thanh toán</label>
            {pmLoading && <p className="text-sm text-slate-500">Đang tải cấu hình…</p>}
            {!pmLoading && onlineMethodOptions.length === 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Chưa bật VNPay hoặc ZaloPay trong cấu hình hệ thống. Vui lòng liên hệ quản trị viên (mục Thanh toán tại{' '}
                <span className="font-mono">/admin/config</span>).
              </p>
            )}
            {!pmLoading && lockedOrderGateway != null && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                <p className="text-xs text-slate-500">Theo đơn hàng (showroom đã chọn)</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {lockedOrderGateway === 'vnpay' ? 'VNPay' : 'ZaloPay'}
                </p>
                {!lockedGatewayAvailable && (
                  <p className="mt-2 text-xs text-amber-800">
                    Cổng này chưa được bật trong cấu hình thanh toán — vui lòng liên hệ showroom để được hỗ trợ.
                  </p>
                )}
              </div>
            )}
            {!pmLoading && lockedOrderGateway == null && onlineMethodOptions.length > 0 && (
              <div className="space-y-2">
                {onlineMethodOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input type="radio" value={opt.value} {...register('paymentMethod')} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm font-medium">Số tiền: {amount ? formatPrice(amount) : '-'}</p>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Quay lại
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || redirecting}
              disabled={
                redirecting ||
                pmLoading ||
                onlineMethodOptions.length === 0 ||
                (lockedOrderGateway != null && !lockedGatewayAvailable)
              }
            >
              {redirecting ? 'Đang chuyển tới cổng thanh toán…' : orderId != null ? 'Xác Nhận Thanh Toán' : 'Xác Nhận Đặt Cọc'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
