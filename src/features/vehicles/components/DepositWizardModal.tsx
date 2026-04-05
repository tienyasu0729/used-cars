import { useState, useEffect, useRef } from 'react'
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
import { formatPrice } from '@/utils/format'

const schema = z.object({
  amount: z.number().min(1000000, 'Tối thiểu 1.000.000 ₫'),
  paymentMethod: z.string().min(1, 'Vui lòng chọn phương thức'),
})

type FormData = z.infer<typeof schema>

interface DepositWizardModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string | number
  vehicleName?: string
  vehiclePrice?: number
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount ?? 10000000,
      paymentMethod: 'bank_transfer',
    },
  })

  const amount = watch('amount')

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setRedirecting(false)
      submitLockRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      reset({
        amount: defaultAmount ?? 10000000,
        paymentMethod: 'bank_transfer',
      })
    }
  }, [isOpen, defaultAmount, reset])

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
      addToast('error', 'Vui lòng nhập số tiền cọc hợp lệ.')
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
        window.location.assign(url)
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
          window.location.assign(url)
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
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt Cọc Giữ Xe">
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
          <p className="text-sm text-slate-600">Xe: {vehicleName ?? 'N/A'}</p>
          {vehiclePrice && (
            <p className="font-bold text-[#E8612A]">{formatPrice(vehiclePrice)}</p>
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
            label="Số tiền cọc (VND)"
            type="number"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
          />
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
            <div className="space-y-2">
              {[
                { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
                { value: 'vnpay', label: 'VNPay' },
                { value: 'zalopay', label: 'ZaloPay' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('paymentMethod')}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-sm font-medium">Số tiền: {amount ? formatPrice(amount) : '-'}</p>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Quay lại
            </Button>
            <Button type="submit" loading={isSubmitting || redirecting} disabled={redirecting}>
              {redirecting ? 'Đang chuyển tới cổng thanh toán…' : 'Xác Nhận Đặt Cọc'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
