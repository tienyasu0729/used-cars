import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'
import { SignaturePad } from '@/components/contract/SignaturePad'
import { isoDateToDdMmYyyy } from '@/utils/dateDdMmYyyy'

const inputCls = 'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

interface Props {
  form: UseFormReturn<FullInstallmentData>
}

export function StepCommitment({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form
  const [signaturePreview, setSignaturePreview] = useState<string | null>(
    watch('signatureUrl') || null,
  )

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignaturePreview(dataUrl)
    setValue('signatureUrl', dataUrl ?? '', { shouldDirty: true })
    if (dataUrl) {
      setValue('signedDate', isoDateToDdMmYyyy(new Date().toISOString().slice(0, 10)), { shouldDirty: true, shouldValidate: true })
    } else {
      setValue('signedDate', '', { shouldDirty: true, shouldValidate: true })
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cam kết & Chữ ký</h2>
          <p className="text-sm text-slate-500">Xác nhận thông tin chính xác và ký tên</p>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Nội dung cam kết</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tôi xác nhận toàn bộ thông tin khai trong hồ sơ này là đúng sự thật.</li>
          <li>Tôi đồng ý cho hệ thống gửi hồ sơ đến ngân hàng để thẩm định tín dụng.</li>
          <li>Tôi hiểu rằng việc khai sai thông tin có thể dẫn đến từ chối hồ sơ hoặc xử lý pháp luật.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register('agreedTerms')}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-slate-700">
            Tôi cam kết thông tin khai trong hồ sơ là chính xác và chịu trách nhiệm trước pháp luật.
          </span>
        </label>
        {errors.agreedTerms && <p className="pl-7 text-xs text-red-500">{errors.agreedTerms.message}</p>}

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register('agreedPrivacy')}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-slate-700">
            Tôi đồng ý với <a href="/privacy" target="_blank" className="text-primary underline">điều khoản bảo mật</a> và cho phép
            ngân hàng tra cứu thông tin tín dụng của tôi.
          </span>
        </label>
        {errors.agreedPrivacy && <p className="pl-7 text-xs text-red-500">{errors.agreedPrivacy.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Chữ ký điện tử</label>
        <SignaturePad
          initialDataUrl={signaturePreview}
          onSignatureChange={handleSignatureChange}
        />
        {!signaturePreview && (
          <p className="mt-1 text-xs text-slate-400">Vẽ chữ ký trên ô trắng phía trên</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Ngày ký</label>
        <input type="text" {...register('signedDate')} className={`${inputCls} bg-slate-50`} readOnly placeholder="dd/mm/yyyy" />
        {errors.signedDate && <p className="mt-1 text-xs text-red-500">{errors.signedDate.message}</p>}
      </div>
    </div>
  )
}
