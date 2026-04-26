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
  loanAmount?: number
  loanTermMonths?: number
  repaymentMethod?: string
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
  bankLoanId: string | null
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
  loanAmount: number | null
  loanTermMonths: number | null
  repaymentMethod: string | null
  agreedTerms: boolean | null
  agreedPrivacy: boolean | null
  signatureUrl: string | null
  signedDate: string | null
  status: string
  rejectionReason: string | null
  bankPdfUrl: string | null
  documents: InstallmentDocumentDTO[]
  createdAt: string
  updatedAt: string
}

export interface InstallmentDocumentDTO {
  id: number
  documentType: string
  documentUrl: string
  originalFileName: string
  uploadedAt: string
}

interface ApiResponse<T> { data: T }

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

  async getMyApplications(): Promise<InstallmentApplicationDTO[]> {
    const res = await axiosInstance.get<ApiResponse<InstallmentApplicationDTO[]>>(
      '/installments/applications/me',
    )
    return (res as unknown as ApiResponse<InstallmentApplicationDTO[]>).data
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
}
