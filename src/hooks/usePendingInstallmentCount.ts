import { useQuery } from '@tanstack/react-query'
import { installmentService } from '@/services/installment.service'

export function usePendingInstallmentCount() {
  return useQuery({
    queryKey: ['installments', 'pending-count'],
    queryFn: async () => {
      const rows = await installmentService.getAllApplications('PENDING_DOCUMENT')
      return rows.length
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
  })
}

