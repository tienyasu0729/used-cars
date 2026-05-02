import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type {
  ContractPreview,
  CompleteContractRequest,
  CloudinarySignedUpload,
  DocumentSessionResponse,
} from '@/types/contract.types'

export const contractService = {
  async getContractPreview(bookingId: number): Promise<ContractPreview> {
    const res = (await axiosInstance.get(
      `/bookings/${bookingId}/contract`,
    )) as unknown as ApiResponse<ContractPreview>
    return res.data as ContractPreview
  },

  async getStaffContractPreview(bookingId: number): Promise<ContractPreview> {
    const res = (await axiosInstance.get(
      `/staff/bookings/${bookingId}/contract`,
    )) as unknown as ApiResponse<ContractPreview>
    return res.data as ContractPreview
  },

  async getSignatureUploadUrls(
    bookingId: number,
  ): Promise<Record<string, CloudinarySignedUpload>> {
    const res = (await axiosInstance.post(
      `/bookings/${bookingId}/contract/signature-urls`,
    )) as unknown as ApiResponse<Record<string, CloudinarySignedUpload>>
    return res.data as Record<string, CloudinarySignedUpload>
  },

  async completeContract(
    bookingId: number,
    data: CompleteContractRequest,
  ): Promise<ContractPreview> {
    const res = (await axiosInstance.post(
      `/bookings/${bookingId}/contract/complete`,
      data,
    )) as unknown as ApiResponse<ContractPreview>
    return res.data as ContractPreview
  },

  getContractPdfUrl(bookingId: number): string {
    return `/bookings/${bookingId}/contract/pdf`
  },

  async downloadStaffContractPdf(bookingId: number): Promise<Blob> {
    return (await axiosInstance.get(
      `/staff/bookings/${bookingId}/contract/pdf`,
      { responseType: 'blob' },
    )) as unknown as Blob
  },

  async createDocumentSession(
    bookingId: number,
    purpose: string,
  ): Promise<DocumentSessionResponse> {
    const res = (await axiosInstance.post('/document-sessions', {
      bookingId,
      purpose,
    })) as unknown as ApiResponse<DocumentSessionResponse>
    return res.data as DocumentSessionResponse
  },

  async pollDocumentSession(
    sessionId: string,
  ): Promise<DocumentSessionResponse> {
    const res = (await axiosInstance.get(
      `/document-sessions/${sessionId}/poll`,
    )) as unknown as ApiResponse<DocumentSessionResponse>
    return res.data as DocumentSessionResponse
  },
}
