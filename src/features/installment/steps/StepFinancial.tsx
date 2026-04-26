import { Wallet } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'

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
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
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
          <input type="number" {...register('monthlyIncome')} className={inputCls} placeholder="15000000" />
        </Field>
        <Field label="Chi phí sinh hoạt / tháng (VNĐ)" error={errors.monthlyExpenses?.message}>
          <input type="number" {...register('monthlyExpenses')} className={inputCls} placeholder="5000000" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Khoản vay hiện tại (VNĐ)" error={errors.existingLoans?.message}>
          <input type="number" {...register('existingLoans')} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Số người phụ thuộc" error={errors.dependentsCount?.message}>
          <input type="number" {...register('dependentsCount')} className={inputCls} placeholder="0" />
        </Field>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
        Ngân hàng sẽ đánh giá khả năng trả nợ dựa trên tỷ lệ: (thu nhập − chi phí − nợ hiện tại) / khoản trả hàng tháng.
        Hãy khai chính xác để tăng khả năng duyệt hồ sơ.
      </div>
    </div>
  )
}
