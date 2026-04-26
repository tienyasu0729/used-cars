import { useEffect } from 'react'
import { Banknote } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'
import { formatPriceNumber } from '@/utils/format'

const inputCls = 'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const REPAYMENT_METHODS = [
  { value: 'EQUAL_PRINCIPAL_INTEREST', label: 'Gốc + Lãi đều hàng tháng' },
  { value: 'DECLINING_INTEREST', label: 'Lãi giảm dần (gốc đều)' },
]

interface Props {
  form: UseFormReturn<FullInstallmentData>
  vehiclePrice: number
}

export function StepLoanDetails({ form, vehiclePrice }: Props) {
  const { register, formState: { errors }, watch, setValue } = form
  const prepayment = watch('prepaymentAmount') || 0

  useEffect(() => {
    setValue('vehiclePrice', vehiclePrice)
    const loan = vehiclePrice - Number(prepayment)
    if (loan >= 0) setValue('loanAmount', loan)
  }, [vehiclePrice, prepayment, setValue])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Banknote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Chi tiết khoản vay</h2>
          <p className="text-sm text-slate-500">Giá xe, phương án trả góp & hình thức trả nợ</p>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-4">
        <p className="text-sm text-slate-600">Giá xe</p>
        <p className="text-2xl font-black text-primary">{formatPriceNumber(vehiclePrice)} VNĐ</p>
        <input type="hidden" {...register('vehiclePrice')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Số tiền trả trước (VNĐ)" error={errors.prepaymentAmount?.message}>
          <input type="number" {...register('prepaymentAmount')} className={inputCls} placeholder="100000000" />
        </Field>
        <Field label="Số tiền vay (tự tính)" error={errors.loanAmount?.message}>
          <input type="number" {...register('loanAmount')} className={`${inputCls} bg-slate-50`} readOnly />
        </Field>
      </div>

      <Field label="Kỳ hạn vay (tháng)" error={errors.loanTermMonths?.message}>
        <select {...register('loanTermMonths')} className={inputCls}>
          <option value="">— Chọn —</option>
          {[12, 24, 36, 48, 60, 72, 84].map((t) => (
            <option key={t} value={t}>{t} tháng ({t / 12} năm)</option>
          ))}
        </select>
      </Field>

      <Field label="Phương thức trả nợ" error={errors.repaymentMethod?.message}>
        <select {...register('repaymentMethod')} className={inputCls}>
          <option value="">— Chọn —</option>
          {REPAYMENT_METHODS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>
    </div>
  )
}
