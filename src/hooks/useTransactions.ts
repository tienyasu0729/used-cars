import { useQuery } from '@tanstack/react-query'
import type { Transaction } from '@/types'

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/transactions')
        if (!res.ok) return [] as Transaction[]
        const data: unknown = await res.json()
        return asList<Transaction>(data)
      } catch {
        return [] as Transaction[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
