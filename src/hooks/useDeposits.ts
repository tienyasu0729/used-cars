import { useQuery } from '@tanstack/react-query'
import { mockDeposits } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchDeposits() {
  if (isMockMode()) return mockDeposits
  try {
    const res = await fetch('/api/deposits')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockDeposits
    }
  } catch {}
  return mockDeposits
}

export function useDeposits() {
  return useQuery({
    queryKey: ['deposits', isMockMode()],
    queryFn: fetchDeposits,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
