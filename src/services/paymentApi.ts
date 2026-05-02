import { api } from './apiClient'
import type { ApiResponse } from '@/types/auth.types'

export const PAYMENT_RETURN_CONTEXT_KEY = 'payment_return_context'

const PAYMENT_RETURN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function setPaymentReturnContext(ctx: {
  kind: 'order' | 'deposit'
  id: number
  vehicleId?: number
  flow?: 'default' | 'installment_wizard' | 'installment_status'
}) {
  sessionStorage.setItem(
    PAYMENT_RETURN_CONTEXT_KEY,
    JSON.stringify({ ...ctx, at: Date.now() }),
  )
}

export interface PaymentReturnContext {
  kind: 'order' | 'deposit'
  id: number
  vehicleId?: number
  flow?: 'default' | 'installment_wizard' | 'installment_status'
  at?: number
}

function readPaymentReturnContext(): PaymentReturnContext | null {
  try {
    const raw = sessionStorage.getItem(PAYMENT_RETURN_CONTEXT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PaymentReturnContext
  } catch {
    return null
  }
}

export function getPaymentReturnVehicleIdForDeposit(depositId: string | number | null | undefined): number | null {
  if (depositId == null || depositId === '') return null
  const o = readPaymentReturnContext()
  if (!o) return null
  if (o.kind !== 'deposit' || o.id == null || String(o.id) !== String(depositId)) return null
  if (o.at != null && Date.now() - o.at > PAYMENT_RETURN_MAX_AGE_MS) return null
  const v = o.vehicleId
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null
}

export function getPaymentReturnContextForDeposit(depositId: string | number | null | undefined): PaymentReturnContext | null {
  if (depositId == null || depositId === '') return null
  const o = readPaymentReturnContext()
  if (!o) return null
  if (o.kind !== 'deposit' || o.id == null || String(o.id) !== String(depositId)) return null
  if (o.at != null && Date.now() - o.at > PAYMENT_RETURN_MAX_AGE_MS) return null
  return o
}

export function paymentInitErrorMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string } } }
  const m = ax.response?.data?.message
  if (typeof m === 'string' && m.trim()) {
    const t = m.trim()
    if (/Thiếu cấu hình/i.test(t)) {
      return `${t} Vui lòng cấu hình tại /admin/config (mục Thanh toán).`
    }
    return t
  }
  return 'Không tạo được liên kết thanh toán.'
}

export interface PaymentDepositMethods {
  cash: boolean
  vnpay: boolean
  zalopay: boolean
}

export interface PaymentUrlPayload {
  paymentUrl: string
}

export interface OrderPaymentStaffRow {
  id: number
  paymentMethod: string
  status: string
  amount: number
  transactionRef: string | null
  vnpPayCreateDate: string | null
  vnpGatewayTransactionNo: string | null
  vnpLastRefundRequestId: string | null
}

export interface VnpayClientReturnPayload {
  success: boolean
  code: string
  kind: string
  orderId: number | null
  depositId: number | null
}

export interface ZaloPayStatusPayload {
  gateway: Record<string, unknown>
  localStatus: string
  synced: boolean
  orderPaymentId?: number | null
  depositId?: number | null
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as ApiResponse<T>).data !== undefined) {
    return (raw as ApiResponse<T>).data
  }
  return raw as T
}

export const paymentApi = {
  async getDepositMethods(): Promise<PaymentDepositMethods> {
    const res = await api.get<ApiResponse<PaymentDepositMethods>>('/payment/deposit-methods')
    return unwrap<PaymentDepositMethods>(res.data)
  },

  async createVnpay(orderId: number, amount: number): Promise<string> {
    const res = await api.post<ApiResponse<PaymentUrlPayload>>('/payment/vnpay/create', { orderId, amount })
    const data = unwrap<PaymentUrlPayload>(res.data)
    if (!data.paymentUrl?.trim()) {
      throw new Error('EMPTY_PAYMENT_URL')
    }
    return data.paymentUrl.trim()
  },

  async createZaloPay(orderId: number, amount: number): Promise<string> {
    const res = await api.post<ApiResponse<PaymentUrlPayload>>('/payment/zalopay/create', { orderId, amount })
    const data = unwrap<PaymentUrlPayload>(res.data)
    if (!data.paymentUrl?.trim()) {
      throw new Error('EMPTY_PAYMENT_URL')
    }
    return data.paymentUrl.trim()
  },

  async listOrderPayments(orderId: number): Promise<OrderPaymentStaffRow[]> {
    const res = await api.get<ApiResponse<OrderPaymentStaffRow[]>>(`/payment/orders/${orderId}/payments`)
    return unwrap<OrderPaymentStaffRow[]>(res.data)
  },

  async vnpayQuery(orderPaymentId: number): Promise<unknown> {
    const res = await api.post<ApiResponse<unknown>>('/payment/vnpay/query', { orderPaymentId })
    return unwrap<unknown>(res.data)
  },

  async vnpayRefund(orderPaymentId: number, orderInfo?: string): Promise<unknown> {
    const body: { orderPaymentId: number; orderInfo?: string } = { orderPaymentId }
    if (orderInfo != null && orderInfo.trim() !== '') {
      body.orderInfo = orderInfo.trim()
    }
    const res = await api.post<ApiResponse<unknown>>('/payment/vnpay/refund', body)
    return unwrap<unknown>(res.data)
  },

  async vnpayReturnClient(params: URLSearchParams): Promise<VnpayClientReturnPayload> {
    const q: Record<string, string> = { json: '1' }
    params.forEach((v, k) => {
      if (k !== 'json') {
        q[k] = v
      }
    })
    const res = await api.get<ApiResponse<VnpayClientReturnPayload>>('/payment/vnpay/return', { params: q })
    return unwrap<VnpayClientReturnPayload>(res.data)
  },

  async zaloPayStatus(target: { orderId: number } | { depositId: number }): Promise<ZaloPayStatusPayload> {
    const params =
      'orderId' in target ? { orderId: target.orderId } : { depositId: target.depositId }
    const res = await api.get<ApiResponse<ZaloPayStatusPayload>>('/payment/zalopay/status', { params })
    return unwrap<ZaloPayStatusPayload>(res.data)
  },

  async cancelPendingOrderPayment(orderPaymentId: number): Promise<void> {
    await api.post<ApiResponse<unknown>>(`/payment/order-payment/${orderPaymentId}/cancel`)
  },

  async zaloPayReturn(params: { depositId?: number; orderId?: number }): Promise<{
    success: boolean
    code: string
    depositId?: number | null
  }> {
    const res = await api.get<ApiResponse<{ success: boolean; code: string; depositId?: number | null }>>('/payment/zalopay/return', { params })
    return unwrap<{ success: boolean; code: string; depositId?: number | null }>(res.data)
  },
}
