import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/utils/unwrapApiResponse'

export interface DepositListItem {
  id: string
  vehicleId: string
  customerId: string
  customerName?: string
  vehicleTitle?: string
  vehicleImageUrl?: string | null
  amount: number
  depositDate: string
  expiryDate: string
  createdAt?: string | null
  status: string
  orderId?: string
  /** Cột gateway_txn_ref (cùng nguồn với admin) */
  gatewayTxnRef?: string | null
}

export interface CreateDepositPayload {
  vehicleId: number
  amount: number
  paymentMethod: string
  note?: string
  customerId?: number
  depositDate?: string
  expiryDate?: string
}

export interface CreateDepositResult {
  id: number
  vehicleId: number
  amount: string
  status: string
  paymentUrl: string | null
  depositDate: string
  expiryDate: string
}

export interface DepositListResult {
  items: DepositListItem[]
  meta?: Record<string, unknown>
}

function mapListItem(r: Record<string, unknown>): DepositListItem {
  return {
    id: String(r.id ?? ''),
    vehicleId: String(r.vehicleId ?? ''),
    customerId: String(r.customerId ?? ''),
    customerName: r.customerName != null ? String(r.customerName) : undefined,
    vehicleTitle: r.vehicleTitle != null ? String(r.vehicleTitle) : undefined,
    vehicleImageUrl:
      r.vehicleImageUrl != null && String(r.vehicleImageUrl).trim() !== ''
        ? String(r.vehicleImageUrl)
        : undefined,
    amount: Number(r.amount ?? 0),
    depositDate: String(r.depositDate ?? ''),
    expiryDate: String(r.expiryDate ?? ''),
    createdAt: r.createdAt != null && r.createdAt !== '' ? String(r.createdAt) : undefined,
    status: String(r.status ?? ''),
    orderId: r.orderId != null && r.orderId !== '' ? String(r.orderId) : undefined,
    gatewayTxnRef:
      r.gatewayTxnRef != null && String(r.gatewayTxnRef).trim() !== ''
        ? String(r.gatewayTxnRef).trim()
        : undefined,
  }
}

export const depositApi = {
  async list(params?: { status?: string; page?: number; size?: number }): Promise<DepositListResult> {
    const res = (await axiosInstance.get('/deposits', { params })) as ApiResponse<Record<string, unknown>[]>
    const raw = unwrapApiResponse(res)
    const items = Array.isArray(raw) ? raw.map((row) => mapListItem(row)) : []
    const meta = res.meta != null && typeof res.meta === 'object' ? (res.meta as Record<string, unknown>) : undefined
    return { items, meta }
  },

  async create(payload: CreateDepositPayload): Promise<CreateDepositResult> {
    const res = (await axiosInstance.post('/deposits', payload)) as ApiResponse<CreateDepositResult>
    return unwrapApiResponse(res)
  },

  async cancel(id: number | string, reason?: string): Promise<void> {
    const res = (await axiosInstance.patch(`/deposits/${id}/cancel`, reason ? { reason } : {})) as ApiResponse<null>
    unwrapApiResponse(res)
  },

  async cancelConfirmed(id: number | string, reason: string): Promise<void> {
    const res = (await axiosInstance.post(`/deposits/${id}/cancel-confirmed`, { reason })) as ApiResponse<null>
    unwrapApiResponse(res)
  },

  async confirm(id: number | string): Promise<void> {
    const res = (await axiosInstance.patch(`/deposits/${id}/confirm`)) as ApiResponse<null>
    unwrapApiResponse(res)
  },
}
