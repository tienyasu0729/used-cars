import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2, ArrowLeft, FileText, FileImage, ExternalLink,
  CheckCircle2, Clock, XCircle, Ban, CreditCard,
} from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatPriceNumber } from '@/utils/format'
import { installmentService, type InstallmentApplicationDTO } from '@/services/installment.service'

const STATUS_STEPS = [
  { key: 'PENDING_DOCUMENT', label: 'Chờ hồ sơ', icon: FileText },
  { key: 'BANK_PROCESSING', label: 'Đang thẩm định', icon: Clock },
  { key: 'APPROVED', label: 'Đã duyệt', icon: CheckCircle2 },
  { key: 'DEPOSIT_PENDING', label: 'Chờ đặt cọc', icon: CreditCard },
  { key: 'COMPLETED', label: 'Hoàn tất', icon: CheckCircle2 },
] as const

const TERMINAL_STATUSES = ['REJECTED', 'CANCELLED'] as const

const DOC_TYPE_LABELS: Record<string, string> = {
  CCCD_FRONT: 'CCCD — Mặt trước',
  CCCD_BACK: 'CCCD — Mặt sau',
  INCOME_PROOF: 'Xác nhận thu nhập',
  HOUSEHOLD_REG: 'Sổ hộ khẩu',
  ASSET_PROOF: 'Giấy tờ tài sản',
  OTHER: 'Tài liệu khác',
}

function computeMonthlyPayment(loanAmount: number, termMonths: number, annualRate = 0.08) {
  if (termMonths <= 0 || loanAmount <= 0) return 0
  if (annualRate === 0) return Math.round(loanAmount / termMonths)
  const r = annualRate / 12
  return Math.round((loanAmount * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1))
}

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  if (status === 'DEPOSIT_PAID') return STATUS_STEPS.findIndex(s => s.key === 'DEPOSIT_PENDING')
  return idx >= 0 ? idx : -1
}

export function InstallmentStatusPage() {
  const { id } = useParams<{ id: string }>()
  const appId = id ? parseInt(id, 10) : 0

  const [app, setApp] = useState<InstallmentApplicationDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useDocumentTitle(app ? `Hồ sơ trả góp #${app.id}` : 'Hồ sơ trả góp')

  useEffect(() => {
    if (!appId) return
    setLoading(true)
    installmentService.getById(appId)
      .then(setApp)
      .catch(() => setError('Không tìm thấy hồ sơ hoặc bạn không có quyền xem.'))
      .finally(() => setLoading(false))
  }, [appId])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-slate-500">Đang tải hồ sơ...</p>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Lỗi</h2>
        <p className="mt-2 text-slate-500">{error || 'Không tìm thấy hồ sơ.'}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-primary font-semibold hover:underline">
          ← Về trang quản lý
        </Link>
      </div>
    )
  }

  const isTerminal = TERMINAL_STATUSES.includes(app.status as typeof TERMINAL_STATUSES[number])
  const currentStepIdx = getStepIndex(app.status)
  const monthly = computeMonthlyPayment(
    Number(app.loanAmount || 0),
    Number(app.loanTermMonths || 0),
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Về trang quản lý
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Hồ sơ trả góp #{app.id}</h1>
        <StatusBadge status={app.status} />
      </div>

      {/* Timeline Stepper */}
      {!isTerminal && <TimelineStepper currentStepIdx={currentStepIdx} status={app.status} />}

      {/* Terminal status banner */}
      {app.status === 'REJECTED' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Hồ sơ bị từ chối</p>
            <p className="mt-1 text-sm text-red-700">
              {app.rejectionReason || 'Vui lòng liên hệ nhân viên để biết chi tiết.'}
            </p>
          </div>
        </div>
      )}
      {app.status === 'CANCELLED' && (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <Ban className="h-6 w-6 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-700">Hồ sơ đã hủy</p>
            <p className="mt-1 text-sm text-slate-500">Hồ sơ này không còn hoạt động.</p>
          </div>
        </div>
      )}

      {/* Loan Summary */}
      <SummaryCard app={app} monthly={monthly} />

      {/* PDF link when APPROVED */}
      {app.bankPdfUrl && ['APPROVED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'COMPLETED'].includes(app.status) && (
        <a
          href={app.bankPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition-colors"
        >
          <FileText className="h-6 w-6 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-800">Thông báo đồng ý cho vay</p>
            <p className="text-xs text-emerald-600">Nhấn để xem PDF từ ngân hàng</p>
          </div>
          <ExternalLink className="h-4 w-4 text-emerald-500" />
        </a>
      )}

      {/* Documents */}
      {app.documents.length > 0 && <DocumentsList documents={app.documents} />}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Bản nháp' },
    PENDING_DOCUMENT: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Chờ hồ sơ' },
    BANK_PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang thẩm định' },
    APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Đã duyệt' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    DEPOSIT_PENDING: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Chờ đặt cọc' },
    DEPOSIT_PAID: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Đã đặt cọc' },
    COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Hoàn tất' },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Đã hủy' },
  }
  const s = map[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function TimelineStepper({ currentStepIdx, status }: { currentStepIdx: number; status: string }) {
  const isDone = status === 'COMPLETED' || status === 'DEPOSIT_PAID'
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === currentStepIdx
          const isPassed = idx < currentStepIdx || isDone
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center relative">
              {idx > 0 && (
                <div className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                  isPassed ? 'bg-primary' : 'bg-slate-200'
                }`} />
              )}
              <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                isPassed
                  ? 'border-primary bg-primary text-white'
                  : isActive
                    ? 'border-primary bg-white text-primary'
                    : 'border-slate-200 bg-white text-slate-400'
              }`}>
                {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <p className={`mt-2 text-center text-xs font-medium ${
                isPassed || isActive ? 'text-primary' : 'text-slate-400'
              }`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryCard({ app, monthly }: { app: InstallmentApplicationDTO; monthly: number }) {
  const rows = [
    { label: 'Xe', value: app.vehicleTitle || `#${app.vehicleId}` },
    { label: 'Giá xe', value: app.vehiclePrice ? `${formatPriceNumber(Number(app.vehiclePrice))} đ` : '—' },
    { label: 'Trả trước', value: app.prepaymentAmount ? `${formatPriceNumber(Number(app.prepaymentAmount))} đ` : '—' },
    { label: 'Số tiền vay', value: app.loanAmount ? `${formatPriceNumber(Number(app.loanAmount))} đ` : '—', bold: true },
    { label: 'Kỳ hạn', value: app.loanTermMonths ? `${app.loanTermMonths} tháng` : '—' },
    { label: 'Trả hàng tháng (ước tính)', value: monthly > 0 ? `${formatPriceNumber(monthly)} đ` : '—', bold: true },
  ]
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <h3 className="font-bold text-slate-900">Thông tin khoản vay</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-slate-500">{r.label}</span>
            <span className={`text-sm ${r.bold ? 'font-bold text-primary' : 'font-semibold text-slate-900'}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentsList({ documents }: { documents: InstallmentApplicationDTO['documents'] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <h3 className="font-bold text-slate-900">Tài liệu đã upload ({documents.length})</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {documents.map(doc => (
          <div key={doc.id} className="flex items-center gap-3 px-5 py-3">
            <FileImage className="h-7 w-7 shrink-0 text-primary/60" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {doc.originalFileName || DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
              </p>
              <p className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</p>
            </div>
            <a
              href={doc.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Xem <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
