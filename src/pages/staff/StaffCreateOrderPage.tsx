import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react'
import { mockUsers } from '@/mock'
import { mockBranches } from '@/mock'
import { useInventory } from '@/hooks/useInventory'
import { orderApi } from '@/services/orderApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { formatPrice } from '@/utils/format'

const step1Schema = z.object({
  customerName: z.string().min(2, 'Tối thiểu 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
})

const step2Schema = z.object({
  vehicleId: z.string().min(1, 'Vui lòng chọn xe'),
})

const step3Schema = z.object({
  deposit: z.number().min(0, 'Số tiền phải >= 0'),
  paymentMethod: z.string().min(1, 'Chọn phương thức thanh toán'),
  notes: z.string().optional(),
})

type Step1Form = z.infer<typeof step1Schema>
type Step2Form = z.infer<typeof step2Schema>
type Step3Form = z.infer<typeof step3Schema>

const customers = mockUsers.filter((u) => u.role === 'customer')
const paymentMethods = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'bank_transfer', label: 'Chuyển khoản' },
  { value: 'online', label: 'Thanh toán online' },
]

export function StaffCreateOrderPage() {
  const [step, setStep] = useState(1)
  const [customerId, setCustomerId] = useState<string>('')
  const [vehicleId, setVehicleId] = useState<string>('')
  const [vehiclePrice, setVehiclePrice] = useState(0)
  const navigate = useNavigate()
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const { available: branchVehicles } = useInventory()

  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { customerName: '', phone: '', email: '' },
  })

  const step2Form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { vehicleId: '' },
  })

  const step3Form = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: { deposit: 0, paymentMethod: '', notes: '' },
  })

  const onSearchCustomer = (phone: string) => {
    const c = customers.find((u) => 'phone' in u && u.phone?.includes(phone))
    if (c) {
      step1Form.setValue('customerName', c.name)
      step1Form.setValue('email', c.email)
      step1Form.setValue('phone', (c as { phone?: string }).phone || '')
      setCustomerId(c.id)
    }
  }

  const onVehicleSelect = (id: string) => {
    const v = branchVehicles.find((x) => x.id === id)
    if (v) {
      setVehicleId(id)
      setVehiclePrice(v.price)
      step3Form.setValue('deposit', Math.min(100000000, Math.floor(v.price * 0.2)))
    }
  }

  const handleStep1 = step1Form.handleSubmit((data) => {
    const c = customers.find((u) => u.phone === data.phone || u.email === data.email)
    setCustomerId(c?.id ?? `new_${Date.now()}`)
    setStep(2)
  })

  const handleStep2 = step2Form.handleSubmit((data) => {
    onVehicleSelect(data.vehicleId)
    setStep(3)
  })

  const handleStep3 = step3Form.handleSubmit(async (data) => {
    try {
      const res = await orderApi.createOrder({
        customerId,
        vehicleId,
        price: vehiclePrice,
        deposit: data.deposit,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.addToast('success', `Đơn hàng ${res.data.id} đã tạo thành công`)
      navigate('/staff/orders')
    } catch {
      toast.addToast('error', 'Không thể tạo đơn hàng')
    }
  })

  const selectedVehicle = branchVehicles.find((v) => v.id === vehicleId)
  const selectedBranch = selectedVehicle ? mockBranches.find((b) => b.id === selectedVehicle.branchId) : null

  return (
    <div className="space-y-6">
      <Link
        to="/staff/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#1A3C6E] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách đơn
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-1 ${step >= s ? 'text-[#1A3C6E]' : 'text-slate-400'}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
                {s}
              </span>
              {s < 3 && <ChevronRight className="h-4 w-4" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4 max-w-md">
            <h3 className="text-lg font-bold text-slate-900">Thông tin khách hàng</h3>
            <Input
              label="Họ tên"
              {...step1Form.register('customerName')}
              error={step1Form.formState.errors.customerName?.message}
            />
            <Input
              label="Số điện thoại"
              {...step1Form.register('phone')}
              onBlur={(e) => onSearchCustomer(e.target.value)}
              error={step1Form.formState.errors.phone?.message}
            />
            <Input
              label="Email"
              type="email"
              {...step1Form.register('email')}
              error={step1Form.formState.errors.email?.message}
            />
            <Button type="submit">Tiếp theo</Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4 max-w-md">
            <h3 className="text-lg font-bold text-slate-900">Chọn xe</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Xe</label>
              <select
                {...step2Form.register('vehicleId')}
                onChange={(e) => onVehicleSelect(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">-- Chọn xe --</option>
                {branchVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} {v.year} - {formatPrice(v.price)}
                  </option>
                ))}
              </select>
              {step2Form.formState.errors.vehicleId && (
                <p className="mt-1 text-xs text-red-600">{step2Form.formState.errors.vehicleId.message}</p>
              )}
            </div>
            {selectedVehicle && (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex gap-4">
                  <img
                    src={selectedVehicle.images[0]}
                    alt=""
                    className="h-20 w-28 rounded object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{selectedVehicle.brand} {selectedVehicle.model}</p>
                    <p className="text-[#E8612A] font-bold">{formatPrice(selectedVehicle.price)}</p>
                    <p className="text-sm text-slate-500">{selectedBranch?.name}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button type="submit">Tiếp theo</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-4 max-w-md">
            <h3 className="text-lg font-bold text-slate-900">Thanh toán</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tiền cọc (VND)</label>
              <input
                type="number"
                {...step3Form.register('deposit', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {step3Form.formState.errors.deposit && (
                <p className="mt-1 text-xs text-red-600">{step3Form.formState.errors.deposit.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
              <select
                {...step3Form.register('paymentMethod')}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">-- Chọn --</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.value} value={pm.value}>{pm.label}</option>
                ))}
              </select>
              {step3Form.formState.errors.paymentMethod && (
                <p className="mt-1 text-xs text-red-600">{step3Form.formState.errors.paymentMethod.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
              <textarea
                {...step3Form.register('notes')}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Khách: {step1Form.getValues('customerName')}</p>
              <p className="text-sm text-slate-600">Xe: {selectedVehicle?.brand} {selectedVehicle?.model}</p>
              <p className="text-sm text-slate-600">Tiền cọc: {formatPrice(step3Form.watch('deposit') || 0)}</p>
              <p className="font-bold text-slate-900">Tổng: {formatPrice(vehiclePrice)}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button type="submit">Tạo Đơn Hàng</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
