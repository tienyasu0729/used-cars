import { ShieldCheck, AlertCircle } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { FullInstallmentData } from '../installmentSchema'
import type { InstallmentDocumentDTO } from '@/services/installment.service'
import { formatPriceNumber } from '@/utils/format'

const MIN_REQUIRED_DOCS = 4

interface Props {
  form: UseFormReturn<FullInstallmentData>
  documents: InstallmentDocumentDTO[]
}

function Section({ title, rows }: { title: string; rows: { label: string; value: string | undefined }[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-2">{title}</h3>
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-slate-500">{r.label}</span>
            <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%] truncate">{r.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const fmt = (n?: number | null) => n != null ? `${formatPriceNumber(Number(n))} đ` : ''

const EMPLOYMENT_LABELS: Record<string, string> = {
  SALARIED: 'Nhân viên / Công chức',
  SELF_EMPLOYED: 'Tự kinh doanh',
  FREELANCE: 'Tự do / Freelance',
  RETIRED: 'Đã nghỉ hưu',
  OTHER: 'Khác',
}

const REPAYMENT_LABELS: Record<string, string> = {
  EQUAL_PRINCIPAL_INTEREST: 'Gốc + Lãi đều',
  DECLINING_INTEREST: 'Lãi giảm dần',
}

export function StepReview({ form, documents }: Props) {
  const v = form.getValues()
  const hasEnoughDocs = documents.length >= MIN_REQUIRED_DOCS

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Xác nhận & Gửi hồ sơ</h2>
          <p className="text-sm text-slate-500">Kiểm tra lại toàn bộ thông tin trước khi gửi</p>
        </div>
      </div>

      <Section title="Thông tin cá nhân" rows={[
        { label: 'Họ tên', value: v.fullName },
        { label: 'CCCD/CMND', value: v.identityNumber },
        { label: 'Ngày sinh', value: v.dob },
        { label: 'Ngày cấp', value: v.identityIssuedDate },
        { label: 'Nơi cấp', value: v.identityIssuedPlace },
        { label: 'Điện thoại', value: v.phoneNumber },
        { label: 'Email', value: v.email },
        { label: 'Địa chỉ thường trú', value: v.permanentAddress },
        { label: 'Địa chỉ hiện tại', value: v.currentAddress || '(Trùng thường trú)' },
      ]} />

      <Section title="Nghề nghiệp" rows={[
        { label: 'Loại hình', value: EMPLOYMENT_LABELS[v.employmentType] || v.employmentType },
        { label: 'Công ty / Doanh nghiệp', value: v.companyName || v.businessName },
        { label: 'Chức vụ', value: v.jobTitle },
        { label: 'Thâm niên', value: v.workDuration || v.businessDuration },
        { label: 'Hình thức nhận lương', value: v.salaryMethod },
      ]} />

      <Section title="Tài chính" rows={[
        { label: 'Thu nhập / tháng', value: fmt(v.monthlyIncome) },
        { label: 'Chi phí / tháng', value: fmt(v.monthlyExpenses) },
        { label: 'Khoản vay hiện tại', value: fmt(v.existingLoans) },
        { label: 'Người phụ thuộc', value: v.dependentsCount?.toString() || '0' },
      ]} />

      <Section title="Khoản vay" rows={[
        { label: 'Giá xe', value: fmt(v.vehiclePrice) },
        { label: 'Trả trước', value: fmt(v.prepaymentAmount) },
        { label: 'Số tiền vay', value: fmt(v.loanAmount) },
        { label: 'Kỳ hạn', value: v.loanTermMonths ? `${v.loanTermMonths} tháng` : '' },
        { label: 'Phương thức trả nợ', value: REPAYMENT_LABELS[v.repaymentMethod] || v.repaymentMethod },
      ]} />

      <Section title="Cam kết" rows={[
        { label: 'Cam kết chính xác', value: v.agreedTerms ? 'Đã đồng ý' : 'Chưa' },
        { label: 'Đồng ý bảo mật', value: v.agreedPrivacy ? 'Đã đồng ý' : 'Chưa' },
        { label: 'Ngày ký', value: v.signedDate },
        { label: 'Chữ ký', value: v.signatureUrl ? 'Đã ký' : 'Chưa ký' },
      ]} />

      <Section title="Tài liệu" rows={[
        { label: 'Số file đã upload', value: `${documents.length} file` },
      ]} />

      {!hasEnoughDocs && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Chưa đủ tài liệu bắt buộc</p>
            <p className="mt-0.5">Vui lòng quay lại Bước 5 và upload ít nhất {MIN_REQUIRED_DOCS} tài liệu bắt buộc.</p>
          </div>
        </div>
      )}
    </div>
  )
}
