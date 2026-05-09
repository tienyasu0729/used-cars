import { useQuery } from '@tanstack/react-query'
import { adminTransactionService, type TransactionFilter } from '@/services/adminTransactions.service'

export function useAdminTransactions(filter: TransactionFilter) {
  return useQuery({
    queryKey: ['admin-transactions', filter],
    queryFn: () => adminTransactionService.list(filter),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

export function useAdminTransactionSummary(filter: Omit<TransactionFilter, 'page' | 'size'>) {
  return useQuery({
    queryKey: ['admin-transactions-summary', filter],
    queryFn: () => adminTransactionService.summary(filter),
    staleTime: 30_000,
  })
}

export function useAdminTransactionDetail(source: string | null, id: number | null) {
  return useQuery({
    queryKey: ['admin-transaction-detail', source, id],
    queryFn: () => adminTransactionService.detail(source!, id!),
    enabled: source != null && id != null,
    staleTime: 60_000,
  })
}
