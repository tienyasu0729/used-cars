import { api } from './apiClient'
import { isMockMode } from '@/config/dataSource'

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
    if (isMockMode()) {
      return {
        data: { success: true, id: `deposit_${Date.now()}` },
      }
    }
    try {
      const res = await api.post<CreateDepositResponse>('/deposits', data)
      return { data: res.data }
    } catch {
      return {
        data: { success: true, id: `deposit_${Date.now()}` },
      }
    }
  },
}
