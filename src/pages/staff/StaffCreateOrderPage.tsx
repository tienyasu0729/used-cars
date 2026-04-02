import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { orderApi } from '@/services/orderApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { Input, Button } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import { CreateOrderStepDetails } from '@/features/staff/components/CreateOrderStepDetails'
import { VehicleSearchSelect } from '@/features/staff/components/VehicleSearchSelect'

const step3Schema = z.object({
  customerName: z.string().min(2, 'Tối thiểu 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
})
const step4Schema = z.object({
  deposit: z.number().min(0, 'Số tiền phải >= 0'),
  paymentMethod: z.string().min(1, 'Chọn phương thức thanh toán'),
  notes: z.string().optional(),
})

type Step3Form = z.infer<typeof step3Schema>
type Step4Form = z.infer<typeof step4Schema>

const customers: { id: string; name: string; phone?: string; email?: string }[] = []
const STEPS = ['Chọn Xe', 'Khách Hàng', 'Chi Tiết', 'Xác Nhận']

export function StaffCreateOrderPage() {
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const navigate = useNavigate()
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const { data: inventory, available } = useInventory()
  const branchVehicles = (available?.length ? available : inventory) ?? []

  const selectedVehicle = branchVehicles.find((v) => String(v.id) === vehicleId)
  const vehiclePrice = selectedVehicle?.price ?? 0

  const step3Form = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: { customerName: '', phone: '', email: '' },
  })
  const step4Form = useForm<Step4Form>({
    resolver: zodResolver(step4Schema),
    defaultValues: { deposit: 0, paymentMethod: 'cash', notes: '' },
  })

  const onSearchCustomer = (phone: string) => {
    const c = customers.find((u) => 'phone' in u && u.phone?.includes(phone))
    if (c) {
      step3Form.setValue('customerName', c.name)
      step3Form.setValue('email', c.email ?? '')
      step3Form.setValue('phone', (c as { phone?: string }).phone || '')
      setCustomerId(c.id)
    }
  }

  const handleStep2 = step3Form.handleSubmit((data) => {
    const c = customers.find((u) => u.phone === data.phone || u.email === data.email)
    setCustomerId(c?.id ?? `new_${Date.now()}`)
    step4Form.setValue('deposit', Math.min(100000000, Math.floor((selectedVehicle?.price ?? 0) * 0.1)))
    setStep(3)
  })

  const handleStep3 = step4Form.handleSubmit(() => setStep(4))

  const handleStep4 = async () => {
    const data = step4Form.getValues()
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
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to="/staff/dashboard" className="hover:text-[#1A3C6E]">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/staff/orders" className="hover:text-[#1A3C6E]">Đơn hàng</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Tạo đơn hàng mới</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tạo đơn hàng mới</h1>
        <p className="text-sm text-slate-500">Hoàn tất các bước dưới đây để thiết lập đơn hàng cho khách hàng.</p>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const s = i + 1
          const done = step > s
          const active = step === s
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done ? 'bg-[#1A3C6E] text-white' : active ? 'border-2 border-[#1A3C6E] bg-white text-[#1A3C6E]' : 'border border-slate-300 bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : s}
              </div>
              <span className={`hidden text-sm font-medium sm:inline ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                {s}. {label}
              </span>
              {s < 4 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (vehicleId) setStep(2)
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Chọn xe</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Xe</label>
              <VehicleSearchSelect
                vehicles={branchVehicles ?? []}
                value={vehicleId}
                onChange={setVehicleId}
                placeholder="Tìm kiếm xe theo tên, mã xe hoặc VIN..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/staff/orders')}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button type="submit">Tiếp theo</Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Khách hàng</h3>
            <div className="max-w-md space-y-4">
              <Input label="Họ tên" {...step3Form.register('customerName')} error={step3Form.formState.errors.customerName?.message} />
              <Input
                label="Số điện thoại"
                {...step3Form.register('phone')}
                onBlur={(e) => onSearchCustomer(e.target.value)}
                error={step3Form.formState.errors.phone?.message}
              />
              <Input label="Email" type="email" {...step3Form.register('email')} error={step3Form.formState.errors.email?.message} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button type="submit">Tiếp theo</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-6">
          <CreateOrderStepDetails
            vehicle={selectedVehicle ?? null}
            price={vehiclePrice}
            deposit={step4Form.watch('deposit') || 0}
            onDepositChange={(v) => step4Form.setValue('deposit', v)}
            paymentMethod={step4Form.watch('paymentMethod') || ''}
            onPaymentChange={(v) => step4Form.setValue('paymentMethod', v)}
            notes={step4Form.watch('notes') || ''}
            onNotesChange={(v) => step4Form.setValue('notes', v)}
            onChangeVehicle={() => setStep(1)}
          />
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/staff/orders')} className="text-sm text-slate-500 hover:text-slate-700">
                Hủy bỏ
              </button>
              <Button type="submit">
                Tiếp theo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
            <Info className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
            <p className="text-sm text-slate-700">
              Lưu ý: Đơn hàng sẽ được chuyển sang trạng thái &quot;Chờ xác nhận&quot; sau khi hoàn tất bước tiếp theo. Nhân viên cần kiểm tra kỹ thông tin thuế phí trước khi gửi cho khách hàng.
            </p>
          </div>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={(e) => { e.preventDefault(); handleStep4() }} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Xác nhận đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Khách hàng:</span> {step3Form.getValues('customerName')}</p>
              <p><span className="text-slate-500">Xe:</span> {selectedVehicle?.brand} {selectedVehicle?.model} {selectedVehicle?.year}</p>
              <p><span className="text-slate-500">Giá:</span> {formatPrice(vehiclePrice)}</p>
              <p><span className="text-slate-500">Đặt cọc:</span> {formatPrice(step4Form.watch('deposit') || 0)}</p>
              <p><span className="text-slate-500">Còn lại:</span> {formatPrice(Math.max(0, vehiclePrice - (step4Form.watch('deposit') || 0)))}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/staff/orders')} className="text-sm text-slate-500 hover:text-slate-700">
                Hủy bỏ
              </button>
              <Button type="submit">Tạo đơn hàng</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
