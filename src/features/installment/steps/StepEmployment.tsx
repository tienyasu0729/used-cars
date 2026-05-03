import { Briefcase } from 'lucide-react'
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

const EMPLOYMENT_OPTIONS = [
  { value: 'SALARIED', label: 'Nhân viên / Công chức' },
  { value: 'SELF_EMPLOYED', label: 'Tự kinh doanh' },
  { value: 'FREELANCE', label: 'Tự do / Freelance' },
  { value: 'RETIRED', label: 'Đã nghỉ hưu' },
  { value: 'OTHER', label: 'Khác' },
]

const SALARY_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'MIXED', label: 'Kết hợp' },
]

interface Props {
  form: UseFormReturn<FullInstallmentData, any, any>
}

export function StepEmployment({ form }: Props) {
  const { register, watch, formState: { errors } } = form
  const empType = watch('employmentType')
  const isSelfEmployed = empType === 'SELF_EMPLOYED'
  const isOther = empType === 'OTHER'

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Nghề nghiệp</h2>
          <p className="text-sm text-slate-500">Thông tin về công việc hiện tại</p>
        </div>
      </div>

      <Field label="Loại hình công việc" error={errors.employmentType?.message}>
        <select {...register('employmentType')} className={inputCls}>
          <option value="">— Chọn —</option>
          {EMPLOYMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {isOther && (
        <Field label="Mô tả nghề nghiệp" error={errors.employmentTypeOther?.message}>
          <input {...register('employmentTypeOther')} className={inputCls} placeholder="Ví dụ: Lao động thời vụ, nghề tự do khác..." />
        </Field>
      )}

      {isSelfEmployed ? (
        <>
          <Field label="Tên doanh nghiệp" error={errors.businessName?.message}>
            <input {...register('businessName')} className={inputCls} placeholder="Công ty TNHH ABC" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Loại hình kinh doanh" error={errors.businessType?.message}>
              <input {...register('businessType')} className={inputCls} placeholder="Bán lẻ, Dịch vụ..." />
            </Field>
            <Field label="Thời gian hoạt động" error={errors.businessDuration?.message}>
              <input {...register('businessDuration')} className={inputCls} placeholder="3 năm" />
            </Field>
          </div>
        </>
      ) : (
        <>
          <Field label="Tên công ty / Đơn vị" error={errors.companyName?.message}>
            <input {...register('companyName')} className={inputCls} placeholder="Công ty TNHH ABC" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Chức vụ" error={errors.jobTitle?.message}>
              <input {...register('jobTitle')} className={inputCls} placeholder="Nhân viên kỹ thuật" />
            </Field>
            <Field label="Thâm niên" error={errors.workDuration?.message}>
              <input {...register('workDuration')} className={inputCls} placeholder="2 năm" />
            </Field>
          </div>
          <Field label="Hình thức nhận lương" error={errors.salaryMethod?.message}>
            <select {...register('salaryMethod')} className={inputCls}>
              <option value="">— Chọn —</option>
              {SALARY_METHODS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </>
      )}
    </div>
  )
}
