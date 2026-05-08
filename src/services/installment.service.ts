import axiosInstance from '@/utils/axiosInstance'

export interface InstallmentApplicationPayload {
  vehicleId: number
  fullName?: string
  identityNumber?: string
  phoneNumber?: string
  email?: string
  dob?: string
  identityIssuedDate?: string
  identityIssuedPlace?: string
  permanentAddress?: string
  currentAddress?: string
  employmentType?: string
  companyName?: string
  jobTitle?: string
  workDuration?: string
  salaryMethod?: string
  businessName?: string
  businessType?: string
  businessDuration?: string
  monthlyIncome?: number
  monthlyExpenses?: number
  existingLoans?: number
  dependentsCount?: number
  vehiclePrice?: number
  prepaymentAmount?: number
  prepaymentPercent?: number
  loanAmount?: number
  loanTermMonths?: number
  repaymentMethod?: string
  bankCode?: string
  requestPreDeposit?: boolean
  agreedTerms?: boolean
  agreedPrivacy?: boolean
  signatureUrl?: string
  signedDate?: string
  status?: 'DRAFT' | 'PENDING_DOCUMENT'
}

export interface InstallmentApplicationDTO {
  id: number
  customerId: number
  customerName: string | null
  customerPhone: string | null
  vehicleId: number
  vehicleTitle: string | null
  depositId: number | null
  preDepositId: number | null
  bankLoanId: string | null
  bankCode: string | null
  fullName: string | null
  identityNumber: string | null
  phoneNumber: string | null
  email: string | null
  dob: string | null
  identityIssuedDate: string | null
  identityIssuedPlace: string | null
  permanentAddress: string | null
  currentAddress: string | null
  employmentType: string | null
  companyName: string | null
  jobTitle: string | null
  workDuration: string | null
  salaryMethod: string | null
  businessName: string | null
  businessType: string | null
  businessDuration: string | null
  monthlyIncome: number | null
  monthlyExpenses: number | null
  existingLoans: number | null
  dependentsCount: number | null
  vehiclePrice: number | null
  prepaymentAmount: number | null
  prepaymentPercent: number | null
  loanAmount: number | null
  loanTermMonths: number | null
  repaymentMethod: string | null
  requestPreDeposit: boolean | null
  agreedTerms: boolean | null
  agreedPrivacy: boolean | null
  signatureUrl: string | null
  signedDate: string | null
  status: string
  rejectionReason: string | null
  bankPdfUrl: string | null
  hasValidDepositForVehicle: boolean | null
  depositProofUploaded: boolean | null
  appliedDepositAmount: number | null
  canSubmit: boolean | null
  blockingReason: string | null
  documents: InstallmentDocumentDTO[]
  createdAt: string
  updatedAt: string
}

export interface InstallmentSubmitEligibilityDTO {
  applicationId: number
  vehicleId: number
  hasValidDepositForVehicle: boolean
  depositProofUploaded: boolean
  appliedDepositAmount: number
  canSubmit: boolean
  blockingReason: string | null
}

export interface CreateInstallmentPreDepositPayload {
  paymentMethod: 'cash' | 'vnpay' | 'zalopay' | string
  note?: string
}

export interface CreateInstallmentPreDepositResult {
  id: number
  vehicleId: number
  amount: string
  status: string
  paymentUrl: string | null
  depositDate: string
  expiryDate: string
}

export interface InstallmentDocumentDTO {
  id: number
  documentType: string
  documentUrl: string
  originalFileName: string
  uploadedAt: string
}

interface ApiResponse<T> { data: T }
interface ApiMeta { page?: number; size?: number; totalElements?: number; totalPages?: number }

export interface InstallmentApplicationsQuery {
  page?: number
  size?: number
  status?: string
  q?: string
}

export interface InstallmentApplicationsPageResult {
  items: InstallmentApplicationDTO[]
  meta: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export const installmentService = {
  async create(payload: InstallmentApplicationPayload): Promise<InstallmentApplicationDTO> {
    const res = await axiosInstance.post<ApiResponse<InstallmentApplicationDTO>>(
      '/installments/applications', payload,
    )
    return (res as unknown as ApiResponse<InstallmentApplicationDTO>).data
  },

  async update(id: number, payload: InstallmentApplicationPayload): Promise<InstallmentApplicationDTO> {
    const res = await axiosInstance.put<ApiResponse<InstallmentApplicationDTO>>(
      `/installments/applications/${id}`, payload,
    )
    return (res as unknown as ApiResponse<InstallmentApplicationDTO>).data
  },

  async getMyApplications(query?: InstallmentApplicationsQuery): Promise<InstallmentApplicationsPageResult> {
    const params = {
      page: query?.page ?? 0,
      size: query?.size ?? 10,
      status: query?.status || undefined,
      q: query?.q?.trim() || undefined,
    }
    const res = await axiosInstance.get<ApiResponse<InstallmentApplicationDTO[]>>(
      '/installments/applications/me',
      { params },
    ) as unknown as ApiResponse<InstallmentApplicationDTO[]> & { meta?: ApiMeta }
    const meta = res.meta ?? {}
    return {
      items: res.data ?? [],
      meta: {
        page: Number(meta.page ?? params.page),
        size: Number(meta.size ?? params.size),
        totalElements: Number(meta.totalElements ?? (res.data?.length ?? 0)),
        totalPages: Number(meta.totalPages ?? 1),
      },
    }
  },

  async getById(id: number): Promise<InstallmentApplicationDTO> {
    const res = await axiosInstance.get<ApiResponse<InstallmentApplicationDTO>>(
      `/installments/applications/${id}`,
    )
    return (res as unknown as ApiResponse<InstallmentApplicationDTO>).data
  },

  async uploadDocument(appId: number, file: File, docType: string): Promise<InstallmentDocumentDTO> {
    const form = new FormData()
    form.append('file', file)
    form.append('documentType', docType)
    const res = await axiosInstance.post<ApiResponse<InstallmentDocumentDTO>>(
      `/installments/applications/${appId}/documents`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return (res as unknown as ApiResponse<InstallmentDocumentDTO>).data
  },

  async uploadDepositProof(appId: number, file: File): Promise<InstallmentDocumentDTO> {
    return installmentService.uploadDocument(appId, file, 'DEPOSIT_RECEIPT')
  },

  async deleteDocument(appId: number, docId: number): Promise<void> {
    await axiosInstance.delete(`/installments/applications/${appId}/documents/${docId}`)
  },

  async getAllApplications(status?: string): Promise<InstallmentApplicationDTO[]> {
    const params = status ? { status } : undefined
    const res = await axiosInstance.get<ApiResponse<InstallmentApplicationDTO[]>>(
      '/installments/applications', { params },
    )
    return (res as unknown as ApiResponse<InstallmentApplicationDTO[]>).data
  },

  async appraiseApplication(id: number): Promise<void> {
    await axiosInstance.post(`/installments/applications/${id}/appraise`)
  },

  async cancelApplication(id: number): Promise<void> {
    await axiosInstance.post(`/installments/applications/${id}/cancel`)
  },

  async completeApplication(id: number): Promise<void> {
    await axiosInstance.post(`/installments/applications/${id}/complete`)
  },

  async createOnBehalf(customerId: number, payload: InstallmentApplicationPayload): Promise<InstallmentApplicationDTO> {
    const res = await axiosInstance.post<ApiResponse<InstallmentApplicationDTO>>(
      `/installments/applications/on-behalf?customerId=${customerId}`, payload,
    )
    return (res as unknown as ApiResponse<InstallmentApplicationDTO>).data
  },

  async createPreDeposit(id: number, payload: CreateInstallmentPreDepositPayload): Promise<CreateInstallmentPreDepositResult> {
    const res = await axiosInstance.post<ApiResponse<CreateInstallmentPreDepositResult>>(
      `/installments/applications/${id}/pre-deposit`,
      payload,
    )
    return (res as unknown as ApiResponse<CreateInstallmentPreDepositResult>).data
  },

  async getSubmitEligibility(id: number): Promise<InstallmentSubmitEligibilityDTO> {
    const res = await axiosInstance.get<ApiResponse<InstallmentSubmitEligibilityDTO>>(
      `/installments/applications/${id}/submit-eligibility`,
    )
    return (res as unknown as ApiResponse<InstallmentSubmitEligibilityDTO>).data
  },
}
