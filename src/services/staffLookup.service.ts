import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/utils/unwrapApiResponse'

export interface StaffCustomerOption {
  id: string
  name: string
  phone?: string
  email?: string
}

export async function fetchStaffCustomerOptions(): Promise<StaffCustomerOption[]> {
  const res = (await axiosInstance.get('/staff/customer-options')) as ApiResponse<StaffCustomerOption[]>
  const rows = unwrapApiResponse(res)
  return Array.isArray(rows) ? rows : []
}
