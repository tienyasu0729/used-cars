import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Calendar, UserPlus, FileText, Info, AlertCircle } from 'lucide-react'
import { mockUsers } from '@/mock'
import { useInventory } from '@/hooks/useInventory'
import { depositApi } from '@/services/depositApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui'
import { formatPriceNumber } from '@/utils/format'

const schema = z.object({
  vehicleId: z.string().min(1, 'Chọn xe'),
  customerId: z.string().min(1, 'Chọn khách hàng'),
  amount: z.number().min(10000000, 'Tối thiểu 10.000.000 VND'),
  paymentMethod: z.string().min(1, 'Chọn phương thức'),
  depositDate: z.string().min(1, 'Chọn ngày đặt cọc'),
  expiryDate: z.string().min(1, 'Chọn hạn hết cọc'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const customers = mockUsers.filter((u) => u.role === 'customer')
const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
  { value: 'cash', label: 'Tiền mặt' },
]

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function StaffCreateDepositPage() {
  const navigate = useNavigate()
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const { available: branchVehicles } = useInventory()

  const today = toDateStr(new Date())
  const defaultExpiry = toDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: '',
      customerId: '',
      amount: 10000000,
      paymentMethod: 'bank_transfer',
      depositDate: today,
      expiryDate: defaultExpiry,
      notes: '',
    },
  })

  const filteredVehicles = branchVehicles
  const filteredCustomers = customers

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await depositApi.createDeposit({
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        depositDate: data.depositDate,
        expiryDate: data.expiryDate,
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
      <nav className="text-sm text-slate-500">
        <Link to="/staff/dashboard" className="hover:text-[#1A3C6E]">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/staff/orders" className="hover:text-[#1A3C6E]">Hợp đồng</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Tạo Đặt Cọc</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tạo Phiếu Đặt Cọc</h1>
        <p className="text-sm text-slate-500">Điền thông tin chi tiết để giữ chỗ xe cho khách hàng</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Xe <span className="text-red-500">*</span></label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  {...form.register('vehicleId')}
                  value={form.watch('vehicleId')}
                  onChange={(e) => form.setValue('vehicleId', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm"
                >
                  <option value="">Tìm kiếm xe theo tên hoặc mã VIN...</option>
                  {filteredVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} {v.year} - {formatPriceNumber(v.price)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</span>
              </div>
              {form.formState.errors.vehicleId && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.vehicleId.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Số tiền đặt cọc (VND) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₫</span>
                <input
                  type="number"
                  {...form.register('amount', { valueAsNumber: true })}
                  placeholder="Ví dụ: 20,000,000"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm"
                />
              </div>
              {form.formState.errors.amount && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ngày đặt cọc <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  {...form.register('depositDate', {
                    onChange: (e) => {
                      const d = new Date(e.target.value)
                      d.setDate(d.getDate() + 7)
                      form.setValue('expiryDate', toDateStr(d))
                    },
                  })}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {form.formState.errors.depositDate && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.depositDate.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
              <textarea
                {...form.register('notes')}
                placeholder="Nhập ghi chú thêm về điều kiện đặt cọc hoặc yêu cầu của khách..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Khách hàng <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    {...form.register('customerId')}
                    value={form.watch('customerId')}
                    onChange={(e) => form.setValue('customerId', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm"
                  >
                    <option value="">Tìm khách hàng...</option>
                    {filteredCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {(c as { phone?: string }).phone || c.email}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</span>
                </div>
                <Button type="button" variant="outline" size="sm" className="shrink-0 px-3" title="Thêm khách hàng">
                  <UserPlus className="h-5 w-5" />
                </Button>
              </div>
              {form.formState.errors.customerId && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.customerId.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
              <select
                {...form.register('paymentMethod')}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>{pm.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Hạn hết cọc <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  {...form.register('expiryDate')}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {form.formState.errors.expiryDate && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.expiryDate.message}</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
          <button type="button" onClick={() => navigate('/staff/orders')} className="text-sm text-slate-500 hover:text-slate-700">
            Hủy bỏ
          </button>
          <Button type="submit">
            <FileText className="h-4 w-4" />
            Tạo Đặt Cọc
          </Button>
        </div>
      </form>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Quy định đặt cọc</p>
            <p className="text-xs text-slate-600">Số tiền tối thiểu là 10,000,000 VND cho mỗi xe.</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Thời hạn giữ chỗ</p>
            <p className="text-xs text-slate-600">Mặc định là 07 ngày kể từ ngày đặt cọc thành công.</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
          <FileText className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">In phiếu thu</p>
            <p className="text-xs text-slate-600">Hệ thống tự động tạo file PDF sau khi lưu thành công.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
