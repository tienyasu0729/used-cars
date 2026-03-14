import { useQuery } from '@tanstack/react-query'
import { mockAdminTransfers } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useTransfersAdmin() {
  return useQuery({
    queryKey: ['admin-transfers', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminTransfers
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/transfers')
        return res.data ?? mockAdminTransfers
      } catch {
        return mockAdminTransfers
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
