import { api } from './apiClient'
import { isMockMode } from '@/config/dataSource'
import { mockOrders } from '@/mock'

export interface CreateOrderPayload {
  customerId: string
  vehicleId: string
  price: number
  deposit: number
  paymentMethod: string
  notes?: string
}

export interface CreateOrderResponse {
  id: string
  success: boolean
}

export const orderApi = {
  createOrder: async (data: CreateOrderPayload): Promise<{ data: CreateOrderResponse }> => {
    if (isMockMode()) {
      const num = Math.max(mockOrders.length + 1, 3)
      const id = `ORD-${String(num).padStart(3, '0')}`
      return { data: { id, success: true } }
    }
    const res = await api.post<CreateOrderResponse>('/orders', data)
    return { data: res.data }
  },
}
