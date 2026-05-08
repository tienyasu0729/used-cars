import axiosInstance from '@/utils/axiosInstance'
import type {
  ApproveUsedCarPurchaseRequestPayload,
  CreateUsedCarPurchaseRequestPayload,
  RejectUsedCarPurchaseRequestPayload,
  UsedCarPurchaseRequestDetail,
  UsedCarPurchaseRequestListResponse,
  UsedCarPurchaseRequestSummary,
} from '@/types/pricing.types'

type RawApiList = {
  data?: UsedCarPurchaseRequestListResponse
  items?: UsedCarPurchaseRequestSummary[]
  meta?: UsedCarPurchaseRequestListResponse['meta']
}

function unwrapListResponse(raw: unknown): UsedCarPurchaseRequestListResponse {
  const api = raw as RawApiList
  if (api?.data?.items && api.data.meta) {
    return api.data
  }
  return {
    items: api?.items ?? [],
    meta: api?.meta ?? {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    },
  }
}

function unwrapDetail(raw: unknown): UsedCarPurchaseRequestDetail {
  const api = raw as { data?: UsedCarPurchaseRequestDetail }
  return api?.data ?? (raw as UsedCarPurchaseRequestDetail)
}

export const usedCarPurchaseRequestService = {
  async createManager(payload: CreateUsedCarPurchaseRequestPayload): Promise<UsedCarPurchaseRequestDetail> {
    const res = await axiosInstance.post('/manager/used-car-purchase-requests', payload)
    return unwrapDetail(res)
  },

  async listManager(params?: { page?: number; size?: number; status?: string }): Promise<UsedCarPurchaseRequestListResponse> {
    const res = await axiosInstance.get('/manager/used-car-purchase-requests', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        status: params?.status || undefined,
      },
    })
    return unwrapListResponse(res)
  },

  async getManagerById(id: number): Promise<UsedCarPurchaseRequestDetail> {
    const res = await axiosInstance.get(`/manager/used-car-purchase-requests/${id}`)
    return unwrapDetail(res)
  },

  async markPaid(id: number): Promise<UsedCarPurchaseRequestDetail> {
    const res = await axiosInstance.post(`/manager/used-car-purchase-requests/${id}/mark-paid`)
    return unwrapDetail(res)
  },

  async listAdmin(params?: { page?: number; size?: number; status?: string }): Promise<UsedCarPurchaseRequestListResponse> {
    const res = await axiosInstance.get('/admin/used-car-purchase-requests', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        status: params?.status || undefined,
      },
    })
    return unwrapListResponse(res)
  },

  async getAdminById(id: number): Promise<UsedCarPurchaseRequestDetail> {
    const res = await axiosInstance.get(`/admin/used-car-purchase-requests/${id}`)
    return unwrapDetail(res)
  },

  async approve(id: number, payload: ApproveUsedCarPurchaseRequestPayload): Promise<UsedCarPurchaseRequestDetail> {
    const res = await axiosInstance.post(`/admin/used-car-purchase-requests/${id}/approve`, payload)
    return unwrapDetail(res)
  },

  async reject(id: number, payload: RejectUsedCarPurchaseRequestPayload): Promise<UsedCarPurchaseRequestDetail> {
    const res = await axiosInstance.post(`/admin/used-car-purchase-requests/${id}/reject`, payload)
    return unwrapDetail(res)
  },
}
