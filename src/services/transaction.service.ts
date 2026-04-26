import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { Transaction, TransactionType } from '@/types/transaction'
import { unwrapApiResponse } from '@/utils/unwrapApiResponse'

function parseAmount(s: string): number {
  const n = Number(String(s).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function mapRow(r: Record<string, unknown>): Transaction {
  const st = String(r.status ?? 'Pending')
  const refId = r.referenceId != null ? Number(r.referenceId) : undefined
  return {
    id: String(r.id ?? ''),
    date: String(r.createdAt ?? ''),
    description: String(r.description ?? ''),
    type: String(r.type ?? 'Deposit') as TransactionType,
    amount: parseAmount(String(r.amount ?? '0')),
    status: st as Transaction['status'],
    paymentGateway: r.paymentGateway ? String(r.paymentGateway) : undefined,
    referenceType: r.referenceType ? String(r.referenceType) : undefined,
    referenceId: Number.isFinite(refId) ? refId : undefined,
  }
}

export interface TransactionListResult {
  items: Transaction[]
  meta?: Record<string, unknown>
}

export const transactionApi = {
  async list(params?: {
    type?: string
    fromDate?: string
    toDate?: string
    page?: number
    size?: number
  }): Promise<TransactionListResult> {
    const res = (await axiosInstance.get('/transactions', { params })) as ApiResponse<Record<string, unknown>[]>
    const raw = unwrapApiResponse(res)
    const items = Array.isArray(raw) ? raw.map((row) => mapRow(row)) : []
    const meta = res.meta != null && typeof res.meta === 'object' ? (res.meta as Record<string, unknown>) : undefined
    return { items, meta }
  },
}
