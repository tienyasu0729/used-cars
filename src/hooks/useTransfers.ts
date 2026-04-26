import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { transferService } from '@/services/transfer.service'
import type { TransferStatus } from '@/types/transfer.types'

export interface ManagerTransferListFilters {
  /** Pending | Approved | Rejected | Completed | undefined = tất cả */
  status?: TransferStatus | 'all'
  page: number
  size?: number
}

export function useTransfers(filters: ManagerTransferListFilters) {
  const { user } = useAuthStore()
  const branchKey = user?.branchId ?? 'all'
  const apiStatus =
    filters.status && filters.status !== 'all' ? filters.status : undefined

  return useQuery({
    queryKey: ['manager-transfers', branchKey, apiStatus, filters.page, filters.size ?? 10],
    queryFn: () =>
      transferService.getTransfers({
        status: apiStatus,
        page: filters.page,
        size: filters.size ?? 10,
      }),
    staleTime: 30_000,
  })
}
