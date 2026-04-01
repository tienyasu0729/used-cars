import { useQuery } from '@tanstack/react-query'
import { transferService } from '@/services/transfer.service'
import type { TransferStatus } from '@/types/transfer.types'

export function useTransfersAdmin(params: { page?: number; size?: number; status?: TransferStatus | 'all' }) {
  const page = params.page ?? 0
  const size = params.size ?? 50
  const status = params.status

  return useQuery({
    queryKey: ['admin-transfers', page, size, status],
    queryFn: () =>
      transferService.getTransfers({
        page,
        size,
        status: status && status !== 'all' ? status : undefined,
      }),
    staleTime: 30_000,
  })
}
