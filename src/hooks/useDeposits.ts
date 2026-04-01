import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { Deposit } from '@/types'

async function fetchDeposits(): Promise<Deposit[]> {
  try {
    const res = (await axiosInstance.get('/deposits')) as unknown as ApiResponse<Deposit[]>
    const raw = res.data
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function useDeposits() {
  return useQuery({
    queryKey: ['deposits'],
    queryFn: fetchDeposits,
    staleTime: 1000 * 60 * 2,
  })
}
