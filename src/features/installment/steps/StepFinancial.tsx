import { Wallet } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'
import { formatMoneyInput, parseMoneyInput } from '../moneyInput'

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

interface Props {
  form: UseFormReturn<FullInstallmentData>
}

export function StepFinancial({ form }: Props) {
  const { watch, setValue, register, formState: { errors } } = form
  const monthlyIncome = watch('monthlyIncome')
  const monthlyExpenses = watch('monthlyExpenses')
  const existingLoans = watch('existingLoans')

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tài chính</h2>
          <p className="text-sm text-slate-500">Thu nhập, chi phí và nghĩa vụ tài chính hiện tại</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Thu nhập hàng tháng (VNĐ)" error={errors.monthlyIncome?.message}>
          <input
            type="text"
            inputMode="numeric"
            className={inputCls}
            placeholder="15.000.000"
            value={formatMoneyInput(monthlyIncome)}
            onChange={(e) => setValue('monthlyIncome', parseMoneyInput(e.target.value), { shouldDirty: true, shouldValidate: true })}
          />
        </Field>
        <Field label="Chi phí sinh hoạt / tháng (VNĐ)" error={errors.monthlyExpenses?.message}>
          <input
            type="text"
            inputMode="numeric"
            className={inputCls}
            placeholder="5.000.000"
            value={formatMoneyInput(monthlyExpenses)}
            onChange={(e) => setValue('monthlyExpenses', parseMoneyInput(e.target.value), { shouldDirty: true, shouldValidate: true })}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Khoản vay hiện tại (VNĐ)" error={errors.existingLoans?.message}>
          <input
            type="text"
            inputMode="numeric"
            className={inputCls}
            placeholder="0"
            value={formatMoneyInput(existingLoans)}
            onChange={(e) => setValue('existingLoans', parseMoneyInput(e.target.value), { shouldDirty: true, shouldValidate: true })}
          />
        </Field>
        <Field label="Số người phụ thuộc" error={errors.dependentsCount?.message}>
          <input type="number" {...register('dependentsCount')} className={inputCls} placeholder="0" />
        </Field>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        Ngân hàng sẽ đánh giá khả năng trả nợ dựa trên tỷ lệ: (thu nhập − chi phí − nợ hiện tại) / khoản trả hàng tháng.
        Hãy khai chính xác để tăng khả năng duyệt hồ sơ.
      </div>
    </div>
  )
}
