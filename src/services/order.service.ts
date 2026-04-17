import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { Order, OrderStatus } from '@/types/order'
import { unwrapApiResponse } from '@/utils/unwrapApiResponse'

function parseMoney(s: string | undefined): number {
  if (s == null || s === '') return 0
  const n = Number(String(s).replace(/\s/g, ''))
  return Number.isFinite(n) ? n : 0
}

function mapRow(r: Record<string, unknown>): Order {
  return {
    id: String(r.id ?? ''),
    orderNumber: r.orderNumber != null ? String(r.orderNumber) : undefined,
    vehicleId: String(r.vehicleId ?? ''),
    customerId: String(r.customerId ?? ''),
    customerName: r.customerName != null ? String(r.customerName) : undefined,
    price: parseMoney(String(r.totalPrice ?? '0')),
    deposit: parseMoney(String(r.depositAmount ?? '0')),
    remaining: parseMoney(String(r.remainingAmount ?? '0')),
    status: String(r.status ?? 'Pending') as OrderStatus,
    createdAt: String(r.createdAt ?? ''),
    paymentMethod: r.paymentMethod != null ? String(r.paymentMethod) : undefined,
    notes: r.notes != null ? String(r.notes) : undefined,
  }
}

function mapDetail(r: Record<string, unknown>): Order {
  return {
    ...mapRow(r),
    staffId: r.staffId != null ? String(r.staffId) : undefined,
    staffName: r.staffName != null ? String(r.staffName) : undefined,
    staffEmail: r.staffEmail != null ? String(r.staffEmail) : undefined,
    staffPhone: r.staffPhone != null ? String(r.staffPhone) : undefined,
    branchName: r.branchName != null ? String(r.branchName) : undefined,
    updatedAt: r.updatedAt != null ? String(r.updatedAt) : undefined,
  }
}

export interface CreateOrderPayload {
  customerId: number
  vehicleId: number
  totalPrice: number
  depositId?: number | null
  paymentMethod?: string
  notes?: string
}

export interface CreateOrderResult {
  id: number
  orderNumber: string
  status: string
}

export interface OrderListResult {
  items: Order[]
  meta?: Record<string, unknown>
}

export const orderApi = {
  async list(params?: { status?: string; search?: string; page?: number; size?: number }): Promise<OrderListResult> {
    const res = (await axiosInstance.get('/orders', { params })) as ApiResponse<Record<string, unknown>[]>
    const raw = unwrapApiResponse(res)
    const items = Array.isArray(raw) ? raw.map((row) => mapRow(row)) : []
    const meta = res.meta != null && typeof res.meta === 'object' ? (res.meta as Record<string, unknown>) : undefined
    return { items, meta }
  },

  async getById(id: number | string): Promise<Order> {
    const res = (await axiosInstance.get(`/orders/${id}`)) as ApiResponse<Record<string, unknown>>
    return mapDetail(unwrapApiResponse(res) as Record<string, unknown>)
  },

  async create(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    const body = {
      customerId: payload.customerId,
      vehicleId: payload.vehicleId,
      totalPrice: payload.totalPrice,
      depositId: payload.depositId ?? undefined,
      paymentMethod: payload.paymentMethod ?? undefined,
      notes: payload.notes ?? undefined,
    }
    const res = (await axiosInstance.post('/orders', body)) as ApiResponse<CreateOrderResult>
    return unwrapApiResponse(res)
  },

  async advanceStatus(id: number | string): Promise<void> {
    const res = (await axiosInstance.patch(`/orders/${id}/status`)) as ApiResponse<null>
    unwrapApiResponse(res)
  },

  async cancel(id: number | string, reason?: string): Promise<void> {
    const res = (await axiosInstance.patch(`/orders/${id}/cancel`, reason ? { reason } : {})) as ApiResponse<null>
    unwrapApiResponse(res)
  },

  async confirmSold(id: number | string): Promise<void> {
    const res = (await axiosInstance.patch(`/orders/${id}/confirm-sold`)) as ApiResponse<null>
    unwrapApiResponse(res)
  },

  async addManualPayment(
    id: number | string,
    body: { amount: number; paymentMethod: string; transactionRef?: string },
  ): Promise<void> {
    const res = (await axiosInstance.post(`/orders/${id}/payments`, body)) as ApiResponse<null>
    unwrapApiResponse(res)
  },
}
