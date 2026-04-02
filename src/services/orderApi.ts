import { api } from './apiClient'

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
    const res = await api.post<CreateOrderResponse>('/orders', data)
    return { data: res.data }
  },
}
