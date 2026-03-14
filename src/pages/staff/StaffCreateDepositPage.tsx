import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mockUsers } from '@/mock'
import { mockVehicles } from '@/mock'
import { useAuthStore } from '@/store/authStore'
import { depositApi } from '@/services/depositApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { formatPrice } from '@/utils/format'

const schema = z.object({
  customerId: z.string().min(1, 'Chọn khách hàng'),
  vehicleId: z.string().min(1, 'Chọn xe'),
  amount: z.number().min(1000000, 'Tối thiểu 1.000.000 VND'),
  paymentMethod: z.string().min(1, 'Chọn phương thức'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const customers = mockUsers.filter((u) => u.role === 'customer')
const paymentMethods = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'bank_transfer', label: 'Chuyển khoản' },
]

export function StaffCreateDepositPage() {
  const navigate = useNavigate()
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const branchVehicles = user?.branchId
    ? mockVehicles.filter((v) => v.branchId === user.branchId && v.status === 'Available')
    : mockVehicles.filter((v) => v.status === 'Available')

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: '',
      vehicleId: '',
      amount: 10000000,
      paymentMethod: '',
      notes: '',
    },
  })

  const selectedVehicle = branchVehicles.find((v) => v.id === form.watch('vehicleId'))

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await depositApi.createDeposit({
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      })
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.addToast('success', `Đặt cọc ${res.data.id} đã tạo thành công`)
      navigate('/staff/dashboard')
    } catch {
      toast.addToast('error', 'Không thể tạo đặt cọc')
    }
  })

  return (
    <div className="space-y-6">
      <Link
        to="/staff/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#1A3C6E] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>
      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Tạo Đặt Cọc</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Khách hàng</label>
            <select
              {...form.register('customerId')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {(c as { phone?: string }).phone || c.email}
                </option>
              ))}
            </select>
            {form.formState.errors.customerId && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.customerId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Xe</label>
            <select
              {...form.register('vehicleId')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn xe --</option>
              {branchVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} - {formatPrice(v.price)}
                </option>
              ))}
            </select>
            {form.formState.errors.vehicleId && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.vehicleId.message}</p>
            )}
          </div>
          <Input
            label="Số tiền cọc (VND)"
            type="number"
            {...form.register('amount', { valueAsNumber: true })}
            error={form.formState.errors.amount?.message}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
            <select
              {...form.register('paymentMethod')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn --</option>
              {paymentMethods.map((pm) => (
                <option key={pm.value} value={pm.value}>{pm.label}</option>
              ))}
            </select>
            {form.formState.errors.paymentMethod && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.paymentMethod.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              {...form.register('notes')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          {selectedVehicle && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">{selectedVehicle.brand} {selectedVehicle.model}</p>
              <p className="text-[#E8612A] font-bold">{formatPrice(selectedVehicle.price)}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/staff/dashboard')}>
              Hủy
            </Button>
            <Button type="submit">Tạo Đặt Cọc</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
