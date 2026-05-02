import { User } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'
import { formatDateInputDdMmYyyy } from '@/utils/dateInputMask'

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

export function StepPersonalInfo({ form }: Props) {
  const { register, control, formState: { errors } } = form
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
          <p className="text-sm text-slate-500">Đã điền sẵn từ hồ sơ — chỉ cần bổ sung phần còn thiếu</p>
        </div>
      </div>

      <Field label="Họ và tên" error={errors.fullName?.message}>
        <input {...register('fullName')} className={inputCls} placeholder="Nguyễn Văn A" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Số CCCD / CMND" error={errors.identityNumber?.message}>
          <input {...register('identityNumber')} className={inputCls} placeholder="001234567890" />
        </Field>
        <Field label="Ngày sinh" error={errors.dob?.message}>
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                className={inputCls}
                onChange={(e) => field.onChange(formatDateInputDdMmYyyy(e.target.value))}
              />
            )}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ngày cấp CCCD" error={errors.identityIssuedDate?.message}>
          <Controller
            name="identityIssuedDate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                className={inputCls}
                onChange={(e) => field.onChange(formatDateInputDdMmYyyy(e.target.value))}
              />
            )}
          />
        </Field>
        <Field label="Nơi cấp" error={errors.identityIssuedPlace?.message}>
          <input {...register('identityIssuedPlace')} className={inputCls} placeholder="Cục CS QLHC về TTXH" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Số điện thoại" error={errors.phoneNumber?.message}>
          <input {...register('phoneNumber')} className={inputCls} placeholder="0901234567" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} className={inputCls} placeholder="email@example.com" />
        </Field>
      </div>

      <Field label="Địa chỉ thường trú" error={errors.permanentAddress?.message}>
        <input {...register('permanentAddress')} className={inputCls} placeholder="Số nhà, đường, phường, quận, TP" />
      </Field>

      <Field label="Địa chỉ hiện tại (nếu khác thường trú)" error={errors.currentAddress?.message}>
        <input {...register('currentAddress')} className={inputCls} placeholder="Bỏ trống nếu trùng thường trú" />
      </Field>
    </div>
  )
}
