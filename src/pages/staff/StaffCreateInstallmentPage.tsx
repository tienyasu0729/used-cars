import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ShieldCheck, ChevronLeft, ChevronRight, Send, Loader2, ArrowLeft, Save, Search,
} from 'lucide-react'
import { useVehicleDetail } from '@/hooks/useVehicleDetail'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUsers } from '@/hooks/useUsers'
import { formatPriceNumber } from '@/utils/format'
import { WizardProgressBar } from '@/features/installment/WizardProgressBar'
import { StepDocuments, REQUIRED_DOCUMENT_TYPES, type PendingDocument } from '@/features/installment/StepDocuments'
import {
  fullInstallmentSchema, WIZARD_STEPS, STEP_SCHEMAS,
  type FullInstallmentData,
} from '@/features/installment/installmentSchema'
import { installmentService, type InstallmentDocumentDTO, type InstallmentApplicationPayload } from '@/services/installment.service'
import { StepPersonalInfo } from '@/features/installment/steps/StepPersonalInfo'
import { StepEmployment } from '@/features/installment/steps/StepEmployment'
import { StepFinancial } from '@/features/installment/steps/StepFinancial'
import { StepLoanDetails } from '@/features/installment/steps/StepLoanDetails'
import { StepCommitment } from '@/features/installment/steps/StepCommitment'
import { StepReview } from '@/features/installment/steps/StepReview'

const inputCls = 'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function StaffCreateInstallmentPage() {
  const { vehicleId: paramId } = useParams<{ vehicleId: string }>()
  const vehicleId = paramId ? parseInt(paramId, 10) : 0
  const navigate = useNavigate()
  const { vehicle, isLoading: vehicleLoading } = useVehicleDetail(vehicleId || undefined)

  useDocumentTitle('Tạo hồ sơ trả góp (Staff)')

  const [customerId, setCustomerId] = useState<number | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<InstallmentDocumentDTO[]>([])
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([])

  const { data: users, isLoading: usersLoading } = useUsers({
    role: 'CUSTOMER',
    search: customerSearch || undefined,
  })

  const filteredUsers = useMemo(() => {
    if (!customerSearch.trim()) return users?.slice(0, 10) ?? []
    return users?.slice(0, 20) ?? []
  }, [users, customerSearch])

  const form = useForm<FullInstallmentData>({
    resolver: zodResolver(fullInstallmentSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      fullName: '', identityNumber: '', phoneNumber: '', email: '', dob: '',
      identityIssuedDate: '', identityIssuedPlace: '', permanentAddress: '', currentAddress: '',
      employmentType: undefined, employmentTypeOther: '', companyName: '', jobTitle: '', workDuration: '', salaryMethod: '',
      businessName: '', businessType: '', businessDuration: '',
      monthlyIncome: undefined, monthlyExpenses: undefined, existingLoans: 0, dependentsCount: 0,
      vehiclePrice: vehicle?.price || 0, prepaymentAmount: 0, loanAmount: 0, loanTermMonths: undefined,
      repaymentMethod: '', agreedTerms: undefined as unknown as true,
      agreedPrivacy: undefined as unknown as true, signatureUrl: '', signedDate: '',
    },
  })

  useEffect(() => {
    if (vehicle) form.setValue('vehiclePrice', vehicle.price)
  }, [vehicle, form])

  const selectCustomer = (id: number, name: string, email: string, phone: string) => {
    setCustomerId(id)
    form.setValue('fullName', name)
    form.setValue('email', email)
    form.setValue('phoneNumber', phone)
    setStep(1)
  }

  const hasRequiredDocumentTypes = useMemo(() => {
    const allTypes = new Set([
      ...uploadedDocs.map((d) => d.documentType),
      ...pendingDocs.map((d) => d.documentType),
    ])
    return REQUIRED_DOCUMENT_TYPES.every((type) => allTypes.has(type))
  }, [uploadedDocs, pendingDocs])

  const goNext = async () => {
    if (step === 5 && !hasRequiredDocumentTypes) {
      setError('Vui lòng upload đủ 4 loại tài liệu bắt buộc trước khi tiếp tục.')
      return
    }
    const schema = STEP_SCHEMAS[step - 1]
    if (schema && 'shape' in schema) {
      const fields = Object.keys(schema.shape) as (keyof FullInstallmentData)[]
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    const next = Math.min(step + 1, WIZARD_STEPS.length)
    setStep(next)
  }

  const goBack = () => { setStep(Math.max(step - 1, customerId ? 1 : 0)) }

  const handleSubmit = async () => {
    if (!customerId) return
    if (!hasRequiredDocumentTypes) {
      setError('Vui lòng upload đủ 4 loại tài liệu bắt buộc.')
      setStep(5)
      return
    }
    const valid = await form.trigger()
    if (!valid) { setStep(1); return }
    setIsSaving(true); setError(null)
    try {
      const values = form.getValues()
      const payload: InstallmentApplicationPayload = {
        vehicleId, ...values, dob: values.dob || undefined, status: 'PENDING_DOCUMENT',
      }
      const result = await installmentService.createOnBehalf(customerId, payload)
      setApplicationId(result.id)
      if (pendingDocs.length > 0) {
        for (const pd of pendingDocs) {
          await installmentService.uploadDocument(result.id, pd.file, pd.documentType)
        }
        pendingDocs.forEach(pd => URL.revokeObjectURL(pd.previewUrl))
        setPendingDocs([])
      }
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi tạo hồ sơ')
    } finally {
      setIsSaving(false)
    }
  }

  if (vehicleLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Xe không tồn tại</h2>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tạo hồ sơ thành công!</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Hồ sơ #{applicationId} đã được tạo cho khách hàng. Hồ sơ chờ nhân viên duyệt và gửi thẩm định.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => navigate('/staff/installments')}
            className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer">
            Về danh sách hồ sơ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <div className="mb-8 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {vehicle.images?.[0]?.url && <img src={vehicle.images[0].url} alt={vehicle.title} className="h-16 w-24 rounded-lg object-cover" />}
        <div>
          <h1 className="font-bold text-slate-900">{vehicle.title}</h1>
          <p className="text-lg font-black text-accent">{formatPriceNumber(vehicle.price)} VNĐ</p>
          <p className="text-xs text-slate-400 mt-0.5">Tạo hồ sơ thay khách hàng (Staff)</p>
        </div>
      </div>

      {step === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Chọn khách hàng</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
              className={`${inputCls} pl-10`} placeholder="Tìm theo tên, SĐT, email..." />
          </div>
          {usersLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
            {filteredUsers.map(u => (
              <button key={u.id} type="button" onClick={() => selectCustomer(Number(u.id), u.name, u.email, u.phone)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email} · {u.phone}</p>
                </div>
              </button>
            ))}
            {!usersLoading && filteredUsers.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Không tìm thấy khách hàng</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <WizardProgressBar currentStep={step} onStepClick={(s) => setStep(s)} />
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {step === 1 && <StepPersonalInfo form={form} />}
            {step === 2 && <StepEmployment form={form} />}
            {step === 3 && <StepFinancial form={form} />}
            {step === 4 && <StepLoanDetails form={form} vehiclePrice={vehicle.price} appliedDepositAmount={0} />}
            {step === 5 && (
              <StepDocuments
                uploadedDocs={uploadedDocs}
                pendingDocs={pendingDocs}
                onUploadedDocsChange={setUploadedDocs}
                onPendingDocsChange={setPendingDocs}
              />
            )}
            {step === 6 && <StepCommitment form={form} />}
            {step === 7 && (
              <StepReview
                form={form}
                documentsCount={uploadedDocs.length + pendingDocs.length}
                hasEnoughRequiredDocs={hasRequiredDocumentTypes}
              />
            )}

            {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button type="button" onClick={goBack}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <ChevronLeft className="h-4 w-4" /> Quay lại
              </button>
              <div className="flex items-center gap-3">
                {isSaving && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Save className="h-3.5 w-3.5 animate-pulse" />Đang lưu...</span>}
                {step < WIZARD_STEPS.length ? (
                  <button type="button" onClick={goNext}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary/90 cursor-pointer">
                    Tiếp theo <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 cursor-pointer">
                    <Send className="h-4 w-4" /> Tạo hồ sơ
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
