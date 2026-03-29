import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { mockDeposits } from '@/mock'
import { customerExtrasApiEnabled, isMockMode } from '@/config/dataSource'
import type { ApiResponse } from '@/types/auth.types'
import type { Deposit } from '@/types'

async function fetchDeposits(): Promise<Deposit[]> {
  if (isMockMode() || !customerExtrasApiEnabled()) return mockDeposits
  try {
    const res = (await axiosInstance.get('/deposits')) as unknown as ApiResponse<Deposit[]>
    const raw = res.data
    if (Array.isArray(raw)) return raw
    return mockDeposits
  } catch {
    return mockDeposits
  }
}

export function useDeposits() {
  return useQuery({
    queryKey: ['deposits', isMockMode(), customerExtrasApiEnabled()],
    queryFn: fetchDeposits,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
