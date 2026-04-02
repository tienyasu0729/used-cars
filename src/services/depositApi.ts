import { api } from './apiClient'

export interface CreateDepositPayload {
  vehicleId: string
  customerId: string
  amount: number
  paymentMethod: string
  depositDate?: string
  expiryDate?: string
  notes?: string
}

export interface CreateDepositResponse {
  success: boolean
  id: string
}

export const depositApi = {
  getDeposits: () => api.get('/deposits'),
  createDeposit: async (data: CreateDepositPayload): Promise<{ data: CreateDepositResponse }> => {
    const res = await api.post<CreateDepositResponse>('/deposits', data)
    return { data: res.data }
  },
}
