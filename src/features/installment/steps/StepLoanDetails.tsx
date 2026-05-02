import { useEffect } from 'react'
import { Banknote } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'
import { formatPriceNumber } from '@/utils/format'
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

const REPAYMENT_METHODS = [
  { value: 'EQUAL_PRINCIPAL_INTEREST', label: 'Gốc + Lãi đều hàng tháng' },
  { value: 'DECLINING_INTEREST', label: 'Lãi giảm dần (gốc đều)' },
]
const SUPPORTED_BANKS = [
  { code: 'VCB', name: 'Vietcombank', color: '#059669' },
  { code: 'BIDV', name: 'BIDV', color: '#1D4ED8' },
  { code: 'TCB', name: 'Techcombank', color: '#DC2626' },
  { code: 'MB', name: 'MB Bank', color: '#0369A1' },
  { code: 'ACB', name: 'ACB', color: '#4338CA' },
  { code: 'VPB', name: 'VPBank', color: '#16A34A' },
  { code: 'VIB', name: 'VIB', color: '#0EA5E9' },
  { code: 'SACOMBANK', name: 'Sacombank', color: '#7C3AED' },
] as const

interface Props {
  form: UseFormReturn<FullInstallmentData>
  vehiclePrice: number
  appliedDepositAmount: number
}

export function StepLoanDetails({ form, vehiclePrice, appliedDepositAmount }: Props) {
  const { register, formState: { errors }, watch, setValue } = form
  const prepayment = watch('prepaymentAmount') || 0
  const loanAmount = watch('loanAmount') || 0
  const selectedBankCode = watch('bankCode') || ''

  useEffect(() => {
    setValue('vehiclePrice', vehiclePrice, { shouldDirty: true })
    const deposit = Number(appliedDepositAmount || 0)
    const maxPrepayment = Math.max(0, vehiclePrice - deposit)
    const safePrepayment = Number(prepayment) > maxPrepayment ? maxPrepayment : Number(prepayment)
    if (safePrepayment !== prepayment) {
      setValue('prepaymentAmount', safePrepayment, { shouldDirty: true, shouldValidate: true })
    }
    const loan = Math.max(0, vehiclePrice - safePrepayment - deposit)
    setValue('loanAmount', loan, { shouldDirty: true, shouldValidate: true })
  }, [vehiclePrice, prepayment, appliedDepositAmount, setValue])

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Banknote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Chi tiết khoản vay</h2>
          <p className="text-sm text-slate-500">Giá xe, phương án trả góp và hình thức trả nợ</p>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-4">
        <p className="text-sm text-slate-600">Giá xe</p>
        <p className="text-2xl font-black text-primary">{formatPriceNumber(vehiclePrice)} VNĐ</p>
        <input type="hidden" {...register('vehiclePrice')} />
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-700">Số tiền đã cọc (VNĐ)</p>
        <p className="text-xl font-black text-emerald-700">{formatPriceNumber(Number(appliedDepositAmount) || 0)} VNĐ</p>
        <p className="mt-1 text-xs text-emerald-700/80">Số tiền này được trừ trực tiếp vào khoản vay cần tạo.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Số tiền trả trước (VNĐ)" error={errors.prepaymentAmount?.message}>
          <input
            type="text"
            inputMode="numeric"
            className={inputCls}
            placeholder="100.000.000"
            value={formatMoneyInput(Number(prepayment) || 0)}
            onChange={(e) => setValue('prepaymentAmount', parseMoneyInput(e.target.value), { shouldDirty: true, shouldValidate: true })}
          />
        </Field>
        <Field label="Số tiền vay (tự tính)" error={errors.loanAmount?.message}>
          <input
            type="text"
            value={formatMoneyInput(Number(loanAmount) || 0)}
            className={`${inputCls} bg-slate-50`}
            readOnly
          />
          <input type="hidden" {...register('loanAmount')} />
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

      <Field label="Ngân hàng hỗ trợ" error={errors.bankCode?.message}>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_BANKS.map((bank) => (
            <button
              type="button"
              key={bank.code}
              onClick={() => setValue('bankCode', bank.code, { shouldDirty: true, shouldValidate: true })}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors ${
                selectedBankCode === bank.code
                  ? 'border-primary bg-primary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              title={bank.name}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: bank.color }}
                aria-label={bank.name}
              >
                {bank.code.slice(0, 2)}
              </span>
              <span className="text-xs font-semibold text-slate-700">{bank.code}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register('bankCode')} />
      </Field>
    </div>
  )
}
