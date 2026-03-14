import { useQuery } from '@tanstack/react-query'
import { mockTransactions } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchTransactions() {
  if (isMockMode()) return mockTransactions
  try {
    const res = await fetch('/api/transactions')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockTransactions
    }
  } catch {}
  return mockTransactions
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions', isMockMode()],
    queryFn: fetchTransactions,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
