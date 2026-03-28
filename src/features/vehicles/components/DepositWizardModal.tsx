import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { depositApi } from '@/services/depositApi'
import { formatPrice } from '@/utils/format'

const schema = z.object({
  amount: z.number().min(10000000, 'Tối thiểu 10.000.000 ₫'),
  paymentMethod: z.string().min(1, 'Vui lòng chọn phương thức'),
})

type FormData = z.infer<typeof schema>

interface DepositWizardModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
  vehicleName?: string
  vehiclePrice?: number
}

export function DepositWizardModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  vehiclePrice,
}: DepositWizardModalProps) {
  const [step, setStep] = useState(1)
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: 'bank_transfer',
    },
  })

  const amount = watch('amount')

  useEffect(() => {
    if (!isOpen) setStep(1)
  }, [isOpen])

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return
    try {
      const res = await depositApi.createDeposit({
        vehicleId,
        customerId: String(user.id),
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      })
      if (res.data.success) {
        addToast('success', 'Đặt cọc thành công! Xe được giữ trong 7 ngày.')
        onClose()
      }
    } catch {
      addToast('error', 'Không thể đặt cọc. Vui lòng thử lại.')
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
                { value: 'momo', label: 'MoMo' },
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
            <Button type="submit" loading={isSubmitting}>
              Xác Nhận Đặt Cọc
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
