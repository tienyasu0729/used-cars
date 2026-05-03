import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ShieldCheck, ChevronLeft, ChevronRight, Send, Loader2, ArrowLeft, Save, Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useVehicleDetail } from '@/hooks/useVehicleDetail'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatPriceNumber } from '@/utils/format'
import { navigateToPaymentUrl } from '@/utils/paymentNavigation'
import { resolveUploadPublicUrl } from '@/utils/mediaUrl'
import { isoDateToDdMmYyyy } from '@/utils/dateDdMmYyyy'
import { setPaymentReturnContext } from '@/services/paymentApi'
import { WizardProgressBar } from '@/features/installment/WizardProgressBar'
import { useInstallmentDraft } from '@/features/installment/useInstallmentDraft'
import { StepDocuments, REQUIRED_DOCUMENT_TYPES, type PendingDocument } from '@/features/installment/StepDocuments'
import {
  fullInstallmentSchema, WIZARD_STEPS, STEP_SCHEMAS,
  BANK_CODES,
  type FullInstallmentData,
  type SupportedBankCode,
} from '@/features/installment/installmentSchema'
import {
  installmentService,
  type InstallmentDocumentDTO,
  type InstallmentSubmitEligibilityDTO,
} from '@/services/installment.service'
import { StepPersonalInfo } from '@/features/installment/steps/StepPersonalInfo'
import { StepEmployment } from '@/features/installment/steps/StepEmployment'
import { StepFinancial } from '@/features/installment/steps/StepFinancial'
import { StepLoanDetails } from '@/features/installment/steps/StepLoanDetails'
import { StepCommitment } from '@/features/installment/steps/StepCommitment'
import { StepReview } from '@/features/installment/steps/StepReview'

const ALL_FIELDS: (keyof FullInstallmentData)[] = [
  'fullName', 'identityNumber', 'phoneNumber', 'email', 'dob',
  'identityIssuedDate', 'identityIssuedPlace', 'permanentAddress', 'currentAddress',
  'employmentType', 'employmentTypeOther', 'companyName', 'jobTitle', 'workDuration', 'salaryMethod',
  'businessName', 'businessType', 'businessDuration',
  'monthlyIncome', 'monthlyExpenses', 'existingLoans', 'dependentsCount',
  'vehiclePrice', 'prepaymentAmount', 'loanAmount', 'loanTermMonths', 'repaymentMethod', 'bankCode',
  'agreedTerms', 'agreedPrivacy', 'signatureUrl', 'signedDate',
]

const DEPOSIT_REQUIRED_REASONS = new Set(['DEPOSIT_REQUIRED', 'PRE_DEPOSIT_REQUIRED', 'PRE_DEPOSIT_PAYMENT_REQUIRED'])

function normalizeBankCode(value: string | null): SupportedBankCode | undefined {
  if (!value) return undefined
  const upper = value.trim().toUpperCase()
  return BANK_CODES.find((code) => code === upper)
}

export function InstallmentWizardPage() {
  const { vehicleId: paramId } = useParams<{ vehicleId: string }>()
  const [searchParams] = useSearchParams()
  const vehicleId = paramId ? parseInt(paramId, 10) : 0
  const bankCodeFromQuery = normalizeBankCode(searchParams.get('bankCode'))
  const navigate = useNavigate()
  const { vehicle, isLoading: vehicleLoading } = useVehicleDetail(vehicleId || undefined)
  const user = useAuthStore((s) => s.user)
  const vehicleThumb = vehicle?.images?.[0]?.url ? resolveUploadPublicUrl(vehicle.images[0].url) : null

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
  const [eligibility, setEligibility] = useState<InstallmentSubmitEligibilityDTO | null>(null)
  const [creatingDepositGateway, setCreatingDepositGateway] = useState<'vnpay' | 'zalopay' | null>(null)
  const hydratedApplicationRef = useRef<number | null>(null)

  useEffect(() => {
    if (application?.documents) setUploadedDocs(application.documents as unknown as InstallmentDocumentDTO[])
    if (application?.canSubmit != null) {
      setEligibility({
        applicationId: application.id,
        vehicleId: application.vehicleId,
        hasValidDepositForVehicle: !!application.hasValidDepositForVehicle,
        depositProofUploaded: !!application.depositProofUploaded,
        appliedDepositAmount: Number(application.appliedDepositAmount || 0),
        canSubmit: !!application.canSubmit,
        blockingReason: application.blockingReason,
      })
    }
  }, [application])

  useEffect(() => { setStep(loadStep()) }, [loadStep])

  const form = useForm<FullInstallmentData>({
    resolver: zodResolver(fullInstallmentSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      fullName: user?.name || '', identityNumber: '', phoneNumber: user?.phone || '',
      email: user?.email || '', dob: isoDateToDdMmYyyy(user?.dateOfBirth) || '',
      identityIssuedDate: '', identityIssuedPlace: '', permanentAddress: '', currentAddress: '',
      employmentType: undefined, employmentTypeOther: '', companyName: '', jobTitle: '', workDuration: '', salaryMethod: '',
      businessName: '', businessType: '', businessDuration: '',
      monthlyIncome: undefined, monthlyExpenses: undefined, existingLoans: 0, dependentsCount: 0,
      vehiclePrice: vehicle?.price || 0, prepaymentAmount: 0, loanAmount: 0, loanTermMonths: undefined,
      repaymentMethod: '', bankCode: bankCodeFromQuery ?? 'VCB', agreedTerms: undefined as unknown as true,
      agreedPrivacy: undefined as unknown as true, signatureUrl: '', signedDate: '',
    },
  })

  useEffect(() => {
    if (application && hydratedApplicationRef.current !== application.id) {
      ALL_FIELDS.forEach((f) => {
        const val = application[f as keyof typeof application]
        if (val == null) return
        if (f === 'dob' || f === 'identityIssuedDate' || f === 'signedDate') {
          form.setValue(f, isoDateToDdMmYyyy(String(val)) as never)
          return
        }
        form.setValue(f, val as never)
      })
      hydratedApplicationRef.current = application.id
    } else if (user) {
      if (user.name && !form.getValues('fullName')) form.setValue('fullName', user.name)
      if (user.email && !form.getValues('email')) form.setValue('email', user.email)
      if (user.phone && !form.getValues('phoneNumber')) form.setValue('phoneNumber', user.phone)
      if (user.dateOfBirth && !form.getValues('dob')) form.setValue('dob', isoDateToDdMmYyyy(user.dateOfBirth))
    }
    if (!application && bankCodeFromQuery && !form.getValues('bankCode')) {
      form.setValue('bankCode', bankCodeFromQuery)
    }
  }, [application, user, form, bankCodeFromQuery])

  useEffect(() => {
    const sub = form.watch((data) => saveDraft(data as Partial<FullInstallmentData>))
    return () => sub.unsubscribe()
  }, [form, saveDraft])

  const hasRequiredDocumentTypes = useCallback(() => {
    const allTypes = new Set([
      ...uploadedDocs.map((d) => d.documentType),
      ...pendingDocs.map((d) => d.documentType),
    ])
    return REQUIRED_DOCUMENT_TYPES.every((type) => allTypes.has(type))
  }, [uploadedDocs, pendingDocs])

  const hasDepositReceipt = useCallback(() => {
    const allTypes = new Set([
      ...uploadedDocs.map((d) => d.documentType.toUpperCase()),
      ...pendingDocs.map((d) => d.documentType.toUpperCase()),
    ])
    return allTypes.has('DEPOSIT_RECEIPT')
  }, [uploadedDocs, pendingDocs])

  useEffect(() => {
    if (!submitError) return
    if (!hasDepositReceipt()) return
    const normalized = submitError.toUpperCase()
    if (normalized.includes('CHỨNG TỪ ĐẶT CỌC') || normalized.includes('CHUNG TU DAT COC') || normalized.includes('DEPOSIT')) {
      setSubmitError(null)
    }
  }, [submitError, hasDepositReceipt])

  const refreshEligibility = useCallback(async () => {
    if (!applicationId) return null
    const data = await installmentService.getSubmitEligibility(applicationId)
    setEligibility(data)
    return data
  }, [applicationId])

  const createPreDeposit = useCallback(async (paymentMethod: 'vnpay' | 'zalopay') => {
    if (!applicationId) return
    setSubmitError(null)
    setCreatingDepositGateway(paymentMethod)
    try {
      const res = await installmentService.createPreDeposit(applicationId, { paymentMethod })
      const url = res.paymentUrl?.trim()
      if (!url) {
        setSubmitError('Không nhận được liên kết thanh toán cọc từ máy chủ.')
        return
      }
      if (res.id != null && Number.isFinite(Number(res.id)) && Number(res.id) > 0) {
        setPaymentReturnContext({
          kind: 'deposit',
          id: Number(res.id),
          vehicleId,
          flow: 'installment_wizard',
        })
      }
      navigateToPaymentUrl(url)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể tạo thanh toán cọc. Vui lòng thử lại.'
      setSubmitError(msg)
    } finally {
      setCreatingDepositGateway(null)
    }
  }, [applicationId])

  const goNext = async () => {
    if (step === 5 && !hasRequiredDocumentTypes()) {
      setSubmitError('Vui lòng upload đủ 4 loại tài liệu bắt buộc trước khi tiếp tục.')
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
    saveStep(next)
  }

  const goBack = () => {
    const prev = Math.max(step - 1, 1)
    setStep(prev)
    saveStep(prev)
  }

  const handleDeleteUploaded = useCallback(async (docId: number) => {
    if (!applicationId) return
    await installmentService.deleteDocument(applicationId, docId)
  }, [applicationId])

  const uploadPendingDocNow = useCallback(async (doc: PendingDocument) => {
    if (!applicationId) throw new Error('APPLICATION_NOT_READY')
    const uploaded = await installmentService.uploadDocument(applicationId, doc.file, doc.documentType)
    setUploadedDocs((prev) => [...prev, uploaded])
    setPendingDocs((prev) => prev.filter((d) => d.tempId !== doc.tempId))
    URL.revokeObjectURL(doc.previewUrl)
    if (doc.documentType.toUpperCase() === 'DEPOSIT_RECEIPT') {
      setSubmitError((prev) => {
        if (!prev) return prev
        const normalized = prev.toUpperCase()
        if (normalized.includes('DEPOSIT') || normalized.includes('CHUNG TU DAT COC') || normalized.includes('CHỨNG TỪ ĐẶT CỌC')) {
          return null
        }
        return prev
      })
      try {
        await refreshEligibility()
      } catch {
        // keep UI state; eligibility will be refreshed in submit flow
      }
    }
  }, [applicationId, refreshEligibility])

  const totalDocs = uploadedDocs.length + pendingDocs.length

  const handleSubmit = async () => {
    setSubmitError(null)
    if (!hasRequiredDocumentTypes()) {
      setSubmitError('Vui lòng upload đủ 4 loại tài liệu bắt buộc.')
      setStep(5)
      saveStep(5)
      return
    }
    const valid = await form.trigger()
    if (!valid) {
      setStep(1)
      return
    }

    if (!applicationId) {
      setSubmitError('Hồ sơ chưa được tạo. Vui lòng đợi hệ thống lưu bản nháp rồi thử lại.')
      return
    }

    if (pendingDocs.length > 0) {
      setUploadingDocs(true)
      try {
        const uploaded: InstallmentDocumentDTO[] = []
        for (const pd of pendingDocs) {
          const doc = await installmentService.uploadDocument(applicationId, pd.file, pd.documentType)
          uploaded.push(doc)
        }
        setUploadedDocs((prev) => [...prev, ...uploaded])
        pendingDocs.forEach((pd) => URL.revokeObjectURL(pd.previewUrl))
        setPendingDocs([])
      } catch {
        setSubmitError('Lỗi tải tài liệu lên. Vui lòng thử lại.')
        setUploadingDocs(false)
        return
      }
      setUploadingDocs(false)
    }

    const eligibilityData = await refreshEligibility()
    if (!eligibilityData?.canSubmit) {
      if (eligibilityData?.blockingReason === 'DEPOSIT_PROOF_REQUIRED' && !hasDepositReceipt()) {
        setStep(5)
        saveStep(5)
        setSubmitError('Bạn cần upload ảnh/PDF chứng từ đặt cọc trước khi gửi hồ sơ trả góp.')
      } else if (eligibilityData?.blockingReason && DEPOSIT_REQUIRED_REASONS.has(eligibilityData.blockingReason)) {
        setSubmitError('Bạn cần đặt cọc xe trước qua VNPay/ZaloPay, thanh toán thành công, sau đó upload chứng từ cọc.')
      } else {
        setSubmitError('Hồ sơ chưa đủ điều kiện gửi. Vui lòng hoàn tất bước đặt cọc/chứng từ.')
      }
      return
    }

    try {
      await submitApplication(form.getValues())
      setSubmitted(true)
    } catch {
      // error handled in hook
    }
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
        <Link to="/vehicles" className="mt-4 inline-block font-semibold text-primary hover:underline">← Quay lại danh sách xe</Link>
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
          <Link to="/dashboard" className="rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90">Về trang quản lý</Link>
          <Link to={`/vehicles/${vehicleId}`} className="rounded-lg border border-slate-200 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50">Xem lại xe</Link>
        </div>
      </div>
    )
  }

  const isSubmitting = isSaving || uploadingDocs || creatingDepositGateway != null
  const needsDepositFlow = !!eligibility?.blockingReason && DEPOSIT_REQUIRED_REASONS.has(eligibility.blockingReason)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate(`/vehicles/${vehicleId}`)}
        className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại {vehicle.title}
      </button>

      <div className="mb-8 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {vehicleThumb && <img src={vehicleThumb} alt={vehicle.title} className="h-16 w-24 rounded-lg object-cover" />}
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
        {step === 4 && (
          <StepLoanDetails
            form={form}
            vehiclePrice={vehicle.price}
            appliedDepositAmount={Number(eligibility?.appliedDepositAmount || 0)}
          />
        )}
        {step === 5 && (
          <StepDocuments
            uploadedDocs={uploadedDocs}
            pendingDocs={pendingDocs}
            onUploadedDocsChange={setUploadedDocs}
            onPendingDocsChange={setPendingDocs}
            onDeleteUploaded={handleDeleteUploaded}
            onUploadPendingDoc={uploadPendingDocNow}
          />
        )}
        {step === 6 && <StepCommitment form={form} />}
        {step === 7 && (
          <StepReview
            form={form}
            documentsCount={totalDocs}
            hasEnoughRequiredDocs={hasRequiredDocumentTypes()}
          />
        )}

        {needsDepositFlow && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-semibold">Cần đặt cọc trước khi gửi hồ sơ trả góp</p>
            <p className="mt-1">Đặt cọc qua VNPay/ZaloPay, thanh toán thành công, sau đó upload chứng từ đặt cọc.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => createPreDeposit('vnpay')}
                disabled={isSubmitting || !applicationId}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                <Wallet className="h-3.5 w-3.5" /> {creatingDepositGateway === 'vnpay' ? 'Đang tạo...' : 'Đặt cọc qua VNPay'}
              </button>
              <button
                type="button"
                onClick={() => createPreDeposit('zalopay')}
                disabled={isSubmitting || !applicationId}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                <Wallet className="h-3.5 w-3.5" /> {creatingDepositGateway === 'zalopay' ? 'Đang tạo...' : 'Đặt cọc qua ZaloPay'}
              </button>
            </div>
          </div>
        )}

        {(error || submitError) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submitError || error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            {isSaving && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Save className="h-3.5 w-3.5 animate-pulse" />Đang lưu...</span>}
            {step < WIZARD_STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Tiếp theo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
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
