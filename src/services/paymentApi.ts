import { api } from './apiClient'
import type { ApiResponse } from '@/types/auth.types'

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

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as ApiResponse<T>).data !== undefined) {
    return (raw as ApiResponse<T>).data
  }
  return raw as T
}

export const paymentApi = {
  async createVnpay(orderId: number, amount: number): Promise<string> {
    const res = await api.post<ApiResponse<PaymentUrlPayload>>('/payment/vnpay/create', { orderId, amount })
    const data = unwrap<PaymentUrlPayload>(res.data)
    return data.paymentUrl
  },

  async createZaloPay(orderId: number, amount: number): Promise<string> {
    const res = await api.post<ApiResponse<PaymentUrlPayload>>('/payment/zalopay/create', { orderId, amount })
    const data = unwrap<PaymentUrlPayload>(res.data)
    return data.paymentUrl
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
}
