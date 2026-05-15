import { Calendar, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { CustomerSearchSelect } from '@/features/staff/components/CustomerSearchSelect'
import { VehicleSearchSelect } from '@/features/staff/components/VehicleSearchSelect'
import type { UseFormReturn } from 'react-hook-form'
import type { ShowroomCustomerData } from '@/features/staff/components/ShowroomCustomerModal'

interface FormData {
  vehicleId: string
  customerId?: string
  amount: number
  paymentMethod: string
  depositDate: string
  expiryDate: string
  notes?: string
}

interface DepositFormFieldsProps {
  form: UseFormReturn<FormData>
  filteredVehicles: { id: number; deleted?: boolean; [key: string]: unknown }[]
  filteredCustomers: { id: string; name: string; phone?: string; email?: string }[]
  showroomCustomer: ShowroomCustomerData | null
  customerError?: string
  methodOptions: { value: string; label: string }[]
  onClearShowroom: () => void
  onSelectCustomer: (id: string) => void
  onOpenShowroomModal: () => void
  toDateStr: (d: Date) => string
}

export function DepositFormFields({
  form,
  filteredVehicles,
  filteredCustomers,
  showroomCustomer,
  customerError,
  methodOptions,
  onClearShowroom,
  onSelectCustomer,
  onOpenShowroomModal,
  toDateStr,
}: DepositFormFieldsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Xe <span className="text-red-500">*</span></label>
          <VehicleSearchSelect
            vehicles={filteredVehicles ?? []}
            value={form.watch('vehicleId')}
            onChange={(id) => form.setValue('vehicleId', id)}
            placeholder="Tìm kiếm xe theo tên hoặc mã VIN..."
            error={form.formState.errors.vehicleId?.message}
          />
        </div>
        <div>
          <CurrencyInput
            label="Số tiền đặt cọc (VNĐ) *"
            value={form.watch('amount') || 0}
            onChange={(v) => form.setValue('amount', v, { shouldValidate: true })}
            error={form.formState.errors.amount?.message}
          />
          <input type="hidden" {...form.register('amount', { valueAsNumber: true })} />
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
          {showroomCustomer ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">
              <div className="flex-1 text-sm">
                <p className="font-medium text-emerald-800">{showroomCustomer.fullName}</p>
                <p className="text-emerald-600">{showroomCustomer.phone} &middot; {showroomCustomer.email}</p>
              </div>
              <button type="button" onClick={onClearShowroom} className="rounded p-1 text-emerald-600 hover:bg-emerald-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <CustomerSearchSelect
                  customers={filteredCustomers}
                  value={form.watch('customerId') ?? ''}
                  onChange={onSelectCustomer}
                  placeholder="Nhập tên hoặc SĐT để tìm..."
                  error={customerError}
                />
              </div>
              <Button type="button" variant="outline" className="h-[38px] shrink-0 px-3" title="Thêm khách hàng" onClick={onOpenShowroomModal}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
          <select
            {...form.register('paymentMethod')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            disabled={methodOptions.length === 0}
          >
            {methodOptions.map((pm) => (
              <option key={pm.value} value={pm.value}>{pm.label}</option>
            ))}
          </select>
          {methodOptions.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">Chưa có phương thức nào được bật trong cấu hình thanh toán.</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Hạn hết cọc <span className="text-red-500">*</span></label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="date" {...form.register('expiryDate')} className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm" />
            <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {form.formState.errors.expiryDate && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.expiryDate.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
