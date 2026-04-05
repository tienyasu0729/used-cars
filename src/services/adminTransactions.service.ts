import { api } from './apiClient'
import type { ApiResponse } from '@/types/auth.types'

export type TransactionRow = {
  id: number
  source: 'DEPOSIT' | 'ORDER_PAYMENT'
  sourceId: number
  type: string
  amount: number
  status: string
  statusLabel: string
  paymentGateway: string | null
  gatewayTxnRef: string | null
  customerId: number | null
  customerName: string | null
  customerPhone: string | null
  vehicleId: number | null
  vehicleTitle: string | null
  vehicleListingId: string | null
  branchId: number | null
  branchName: string | null
  orderId: string | null
  depositId: number | null
  createdAt: string
  paidAt: string | null
}

export type TransactionSummary = {
  totalCompleted: number
  totalPending: number
  totalCancelled: number
  countAll: number
}

export type TimelineEvent = {
  event: string
  at: string | null
  detail: string | null
}

export type TransactionDetail = {
  row: TransactionRow
  timeline: TimelineEvent[]
  rawGatewayRef: string | null
  notes: string | null
}

export type TransactionListMeta = {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type TransactionFilter = {
  source?: string
  status?: string
  gateway?: string
  branchId?: number
  keyword?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

function unwrapData<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as ApiResponse<T>).data
  }
  return raw as T
}

function buildParams(filter: Record<string, unknown>): Record<string, string | number | undefined> {
  const out: Record<string, string | number | undefined> = {}
  for (const [k, v] of Object.entries(filter)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = typeof v === 'number' ? v : String(v)
  }
  return out
}

export const adminTransactionService = {
  async list(filter: TransactionFilter): Promise<{ items: TransactionRow[]; meta: TransactionListMeta | undefined }> {
    const res = await api.get<ApiResponse<TransactionRow[]>>('/admin/transactions', {
      params: buildParams(filter as Record<string, unknown>),
    })
    const body = res.data
    return {
      items: body.data ?? [],
      meta: (body.meta ?? undefined) as TransactionListMeta | undefined,
    }
  },

  async summary(filter: Omit<TransactionFilter, 'page' | 'size'>): Promise<TransactionSummary> {
    const res = await api.get<ApiResponse<TransactionSummary>>('/admin/transactions/summary', {
      params: buildParams(filter as Record<string, unknown>),
    })
    return unwrapData<TransactionSummary>(res.data)
  },

  async detail(source: string, id: number): Promise<TransactionDetail> {
    const res = await api.get<ApiResponse<TransactionDetail>>(`/admin/transactions/${source}/${id}`)
    return unwrapData<TransactionDetail>(res.data)
  },

  async exportCsv(filter: Omit<TransactionFilter, 'page' | 'size'>): Promise<Blob> {
    const res = await api.get('/admin/transactions/export', {
      params: buildParams(filter as Record<string, unknown>),
      responseType: 'blob',
    })
    return res.data as Blob
  },
}
