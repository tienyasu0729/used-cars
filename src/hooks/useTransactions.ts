import { useQuery } from '@tanstack/react-query'
import { transactionApi } from '@/services/transaction.service'
import type { Transaction } from '@/types'

export function useTransactions(params?: {
  type?: string
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: ['transactions', params?.type, params?.fromDate, params?.toDate, params?.page, params?.size],
    queryFn: async (): Promise<Transaction[]> => {
      try {
        const { items } = await transactionApi.list({
          type: params?.type,
          fromDate: params?.fromDate,
          toDate: params?.toDate,
          page: params?.page ?? 0,
          size: params?.size ?? 100,
        })
        return items
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
