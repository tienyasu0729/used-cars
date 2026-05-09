/**
 * Tier 3.3 — API điều chuyển xe: GET/POST/PATCH /manager/transfers
 */
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { ApiErrorResponse } from '@/types/auth.types'
import type {
  CreateTransferPayload,
  TransferCompletePayload,
  TransferRequest,
  TransferNotePayload,
} from '@/types/transfer.types'

function mapMeta(meta: unknown): {
  page: number
  size: number
  totalElements: number
  totalPages: number
} {
  const m = meta as Record<string, number>
  return {
    page: m.page ?? 0,
    size: m.size ?? 10,
    totalElements: m.totalElements ?? 0,
    totalPages: m.totalPages ?? 0,
  }
}

export interface TransferListResult {
  items: TransferRequest[]
  meta: ReturnType<typeof mapMeta>
}

export const transferService = {
  async getTransfers(params: {
    status?: string
    page?: number
    size?: number
  }): Promise<TransferListResult> {
    const res = (await axiosInstance.get('/manager/transfers', {
      params: {
        status: params.status && params.status !== 'all' ? params.status : undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    })) as unknown as ApiResponse<TransferRequest[]>
    const items = Array.isArray(res.data) ? res.data : []
    return {
      items,
      meta: mapMeta(res.meta),
    }
  },

  async getTransferById(id: number): Promise<TransferRequest> {
    const res = (await axiosInstance.get(`/manager/transfers/${id}`)) as unknown as ApiResponse<TransferRequest>
    return res.data
  },

  async createTransfer(body: CreateTransferPayload): Promise<TransferRequest> {
    try {
      const res = (await axiosInstance.post('/manager/transfers', body)) as unknown as ApiResponse<TransferRequest>
      return res.data
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'TRANSFER_ALREADY_EXISTS') {
        throw { ...err, message: 'Xe đang có yêu cầu điều chuyển chưa kết thúc.' }
      }
      if (err.errorCode === 'VALIDATION_FAILED') {
        throw { ...err, message: err.message || 'Dữ liệu không hợp lệ.' }
      }
      if (err.errorCode === 'VEHICLE_NOT_AVAILABLE') {
        throw { ...err, message: 'Chỉ xe Available mới tạo điều chuyển.' }
      }
      throw e
    }
  },

  async approveTransfer(id: number, body: TransferNotePayload): Promise<TransferRequest> {
    try {
      const res = (await axiosInstance.post(
        `/manager/transfers/${id}/approve`,
        body
      )) as unknown as ApiResponse<TransferRequest>
      return res.data
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'INVALID_TRANSFER_STATUS') {
        throw {
          ...err,
          message: 'Yêu cầu đã thay đổi trạng thái, vui lòng tải lại trang.',
        }
      }
      throw e
    }
  },

  async rejectTransfer(id: number, body: TransferNotePayload): Promise<TransferRequest> {
    try {
      const res = (await axiosInstance.post(
        `/manager/transfers/${id}/reject`,
        body
      )) as unknown as ApiResponse<TransferRequest>
      return res.data
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'INVALID_TRANSFER_STATUS') {
        throw {
          ...err,
          message: 'Yêu cầu đã thay đổi trạng thái, vui lòng tải lại trang.',
        }
      }
      throw e
    }
  },

  async completeTransfer(id: number, body?: TransferCompletePayload): Promise<TransferRequest> {
    try {
      const res = (await axiosInstance.patch(
        `/manager/transfers/${id}/complete`,
        body ?? {}
      )) as unknown as ApiResponse<TransferRequest>
      return res.data
    } catch (e) {
      const err = e as ApiErrorResponse
      if (err.errorCode === 'TRANSFER_ACCESS_DENIED') {
        throw { ...err, message: 'Chỉ manager chi nhánh nhận xe được xác nhận.' }
      }
      if (err.errorCode === 'INVALID_TRANSFER_STATUS') {
        throw {
          ...err,
          message: 'Yêu cầu đã thay đổi trạng thái, vui lòng tải lại trang.',
        }
      }
      throw e
    }
  },
}
