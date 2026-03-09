import type { PaymentMethod } from '@/types/payment'
import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface CreatePaymentRequest {
  carId: string
  amount: number
  method: PaymentMethod
}

export interface CreatePaymentResponse {
  paymentUrl: string
  transactionId?: string
}

export interface PaymentResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
  transactionId?: string
  amount?: number
  carId?: string
  carName?: string
  method?: PaymentMethod
  paidAt?: string
  reason?: string
}

const isDev = import.meta.env.DEV

export const customerPaymentApi = {
  async createDepositPayment(params: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const { carId, amount, method } = params
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const txnId = `TXN-${Date.now()}`
        const base = typeof window !== 'undefined' ? window.location.origin : ''
        const paymentUrl = `${base}/payment/result?status=success&transactionId=${txnId}&carId=${carId}&amount=${amount}`
        if (isDev) console.debug('Payment transaction created', { transactionId: txnId, carId, amount, method })
        return { paymentUrl, transactionId: txnId }
      })
    }
    const res = await httpClient.post<CreatePaymentResponse>('/payments/create', {
      carId,
      amount,
      method,
    })
    return res.data
  },

  async verifyPayment(transactionId: string, urlParams?: Record<string, string>): Promise<PaymentResult> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        const car = mockCars[0]
        const urlStatus = urlParams?.status
        if (isDev) console.debug('Payment verification', { transactionId, urlStatus })
        const success = urlStatus !== 'failed' && urlStatus !== 'cancel'
        return success
          ? {
              status: 'SUCCESS' as const,
              transactionId,
              amount: 20_000_000,
              carId: car?.id,
              carName: car?.name,
              paidAt: new Date().toISOString(),
            }
          : {
              status: 'FAILED' as const,
              transactionId,
              reason: urlStatus === 'cancel' ? 'User cancelled payment' : 'Payment failed',
            }
      })
    }
    const res = await httpClient.get<PaymentResult>(`/payments/verify/${transactionId}`, {
      params: urlParams,
    })
    return res.data
  },

  async getPaymentResult(transactionId: string): Promise<PaymentResult> {
    return this.verifyPayment(transactionId)
  },

  async getPaymentById(transactionId: string): Promise<PaymentResult | null> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        const car = mockCars[0]
        return {
          status: 'SUCCESS' as const,
          transactionId,
          amount: 20_000_000,
          carId: car?.id,
          carName: car?.name,
          paidAt: new Date().toISOString(),
        }
      })
    }
    const res = await httpClient.get<PaymentResult>(`/payments/${transactionId}`)
    return res.data
  },

  async getPaymentHistory(limit = 20) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockTransactions } = await import('@/mock/mockCustomer')
        return mockTransactions.slice(0, limit).map((t) => ({
          transactionId: t.id,
          amount: t.amount,
          carId: t.carId,
          carName: t.carName,
          status: t.status,
          date: t.date,
        }))
      })
    }
    const res = await httpClient.get(`/payments/history?limit=${limit}`)
    return res.data
  },

  async paymentWebhook(payload: Record<string, unknown>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, processed: true })
    const res = await httpClient.post<{ success: boolean; processed: boolean }>('/payments/webhook', payload)
    return res.data
  },

  async refundPayment(transactionId: string, reason?: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, message: 'Refund initiated' })
    const res = await httpClient.post<{ success: boolean; message?: string }>(`/payments/${transactionId}/refund`, { reason })
    return res.data
  },
}
