import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ShieldCheck, ChevronLeft, ChevronRight, Send, Loader2, ArrowLeft, Save,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useVehicleDetail } from '@/hooks/useVehicleDetail'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatPriceNumber } from '@/utils/format'
import { WizardProgressBar } from '@/features/installment/WizardProgressBar'
import { useInstallmentDraft } from '@/features/installment/useInstallmentDraft'
import { StepDocuments, type PendingDocument } from '@/features/installment/StepDocuments'
import {
  fullInstallmentSchema, WIZARD_STEPS, STEP_SCHEMAS,
  type FullInstallmentData,
} from '@/features/installment/installmentSchema'
import { installmentService, type InstallmentDocumentDTO } from '@/services/installment.service'
import { StepPersonalInfo } from '@/features/installment/steps/StepPersonalInfo'
import { StepEmployment } from '@/features/installment/steps/StepEmployment'
import { StepFinancial } from '@/features/installment/steps/StepFinancial'
import { StepLoanDetails } from '@/features/installment/steps/StepLoanDetails'
import { StepCommitment } from '@/features/installment/steps/StepCommitment'
import { StepReview } from '@/features/installment/steps/StepReview'

const ALL_FIELDS: (keyof FullInstallmentData)[] = [
  'fullName', 'identityNumber', 'phoneNumber', 'email', 'dob',
  'identityIssuedDate', 'identityIssuedPlace', 'permanentAddress', 'currentAddress',
  'employmentType', 'companyName', 'jobTitle', 'workDuration', 'salaryMethod',
  'businessName', 'businessType', 'businessDuration',
  'monthlyIncome', 'monthlyExpenses', 'existingLoans', 'dependentsCount',
  'vehiclePrice', 'prepaymentAmount', 'loanAmount', 'loanTermMonths', 'repaymentMethod',
  'agreedTerms', 'agreedPrivacy', 'signatureUrl', 'signedDate',
]

const MIN_REQUIRED_DOCS = 4

export function InstallmentWizardPage() {
  const { vehicleId: paramId } = useParams<{ vehicleId: string }>()
  const vehicleId = paramId ? parseInt(paramId, 10) : 0
  const navigate = useNavigate()
  const { vehicle, isLoading: vehicleLoading } = useVehicleDetail(vehicleId || undefined)
  const user = useAuthStore((s) => s.user)

  useDocumentTitle(vehicle ? `Đăng ký trả góp - ${vehicle.title}` : 'Đăng ký trả góp')

  const {
    applicationId, application, isSaving, isLoading: draftLoading, error,
    saveDraft, submitApplication, saveStep, loadStep,
  } = useInstallmentDraft(vehicleId)

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<InstallmentDocumentDTO[]>([])
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([])
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (application?.documents) setUploadedDocs(application.documents as unknown as InstallmentDocumentDTO[])
  }, [application])

  useEffect(() => { setStep(loadStep()) }, [loadStep])

  const form = useForm<FullInstallmentData>({
    resolver: zodResolver(fullInstallmentSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: user?.name || '', identityNumber: '', phoneNumber: user?.phone || '',
      email: user?.email || '', dob: user?.dateOfBirth || '',
      identityIssuedDate: '', identityIssuedPlace: '', permanentAddress: '', currentAddress: '',
      employmentType: undefined, companyName: '', jobTitle: '', workDuration: '', salaryMethod: '',
      businessName: '', businessType: '', businessDuration: '',
      monthlyIncome: undefined, monthlyExpenses: undefined, existingLoans: 0, dependentsCount: 0,
      vehiclePrice: vehicle?.price || 0, prepaymentAmount: 0, loanAmount: 0, loanTermMonths: undefined,
      repaymentMethod: '', agreedTerms: undefined as unknown as true,
      agreedPrivacy: undefined as unknown as true, signatureUrl: '', signedDate: '',
    },
  })

  useEffect(() => {
    if (application) {
      ALL_FIELDS.forEach((f) => {
        const val = application[f as keyof typeof application]
        if (val != null) form.setValue(f, val as never)
      })
    } else if (user) {
      if (user.name && !form.getValues('fullName')) form.setValue('fullName', user.name)
      if (user.email && !form.getValues('email')) form.setValue('email', user.email)
      if (user.phone && !form.getValues('phoneNumber')) form.setValue('phoneNumber', user.phone)
      if (user.dateOfBirth && !form.getValues('dob')) form.setValue('dob', user.dateOfBirth)
    }
  }, [application, user, form])

  useEffect(() => {
    const sub = form.watch((data) => saveDraft(data as Partial<FullInstallmentData>))
    return () => sub.unsubscribe()
  }, [form, saveDraft])

  const goNext = async () => {
    const schema = STEP_SCHEMAS[step - 1]
    if (schema && 'shape' in schema) {
      const fields = Object.keys(schema.shape) as (keyof FullInstallmentData)[]
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    const next = Math.min(step + 1, WIZARD_STEPS.length)
    setStep(next); saveStep(next)
  }

  const goBack = () => { const prev = Math.max(step - 1, 1); setStep(prev); saveStep(prev) }

  const handleDeleteUploaded = useCallback(async (docId: number) => {
    if (!applicationId) return
    await installmentService.deleteDocument(applicationId, docId)
  }, [applicationId])

  const totalDocs = uploadedDocs.length + pendingDocs.length

  const handleSubmit = async () => {
    setSubmitError(null)
    if (totalDocs < MIN_REQUIRED_DOCS) { setStep(5); saveStep(5); return }
    const valid = await form.trigger()
    if (!valid) { setStep(1); return }

    if (!applicationId) { setSubmitError('Hồ sơ chưa được tạo.'); return }

    if (pendingDocs.length > 0) {
      setUploadingDocs(true)
      try {
        const uploaded: InstallmentDocumentDTO[] = []
        for (const pd of pendingDocs) {
          const doc = await installmentService.uploadDocument(applicationId, pd.file, pd.documentType)
          uploaded.push(doc)
        }
        setUploadedDocs(prev => [...prev, ...uploaded])
        pendingDocs.forEach(pd => URL.revokeObjectURL(pd.previewUrl))
        setPendingDocs([])
      } catch {
        setSubmitError('Lỗi tải tài liệu lên. Vui lòng thử lại.')
        setUploadingDocs(false)
        return
      }
      setUploadingDocs(false)
    }

    try { await submitApplication(form.getValues()); setSubmitted(true) } catch { /* error in hook */ }
  }

  if (vehicleLoading || draftLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-slate-500">Đang tải thông tin...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Xe không tồn tại</h2>
        <Link to="/vehicles" className="mt-4 inline-block text-primary font-semibold hover:underline">← Quay lại danh sách xe</Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Gửi hồ sơ thành công!</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Hồ sơ trả góp của bạn đã được gửi. Nhân viên sẽ xem xét và liên hệ bạn trong thời gian sớm nhất.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/dashboard" className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors">Về trang quản lý</Link>
          <Link to={`/vehicles/${vehicleId}`} className="rounded-lg border border-slate-200 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Xem lại xe</Link>
        </div>
      </div>
    )
  }

  const isSubmitting = isSaving || uploadingDocs

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(`/vehicles/${vehicleId}`)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Quay lại {vehicle.title}
      </button>

      <div className="mb-8 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {vehicle.thumbnail && <img src={vehicle.thumbnail} alt={vehicle.title} className="h-16 w-24 rounded-lg object-cover" />}
        <div>
          <h1 className="font-bold text-slate-900">{vehicle.title}</h1>
          <p className="text-lg font-black text-accent">{formatPriceNumber(vehicle.price)} VNĐ</p>
        </div>
      </div>

      <WizardProgressBar currentStep={step} onStepClick={(s) => { setStep(s); saveStep(s) }} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && <StepPersonalInfo form={form} />}
        {step === 2 && <StepEmployment form={form} />}
        {step === 3 && <StepFinancial form={form} />}
        {step === 4 && <StepLoanDetails form={form} vehiclePrice={vehicle.price} />}
        {step === 5 && (
          <StepDocuments
            uploadedDocs={uploadedDocs}
            pendingDocs={pendingDocs}
            onUploadedDocsChange={setUploadedDocs}
            onPendingDocsChange={setPendingDocs}
            onDeleteUploaded={handleDeleteUploaded}
          />
        )}
        {step === 6 && <StepCommitment form={form} />}
        {step === 7 && <StepReview form={form} documents={uploadedDocs} />}

        {(error || submitError) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submitError || error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <button type="button" onClick={goBack} disabled={step === 1}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            <ChevronLeft className="h-4 w-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            {isSaving && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Save className="h-3.5 w-3.5 animate-pulse" />Đang lưu...</span>}
            {step < WIZARD_STEPS.length ? (
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 cursor-pointer">
                Tiếp theo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:opacity-60 cursor-pointer">
                {uploadingDocs ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Đang tải tài liệu...</>
                ) : (
                  <><Send className="h-4 w-4" /> Gửi hồ sơ</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
