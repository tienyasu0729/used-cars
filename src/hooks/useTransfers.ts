import { useQuery } from '@tanstack/react-query'
import { mockManagerTransfers, mockIncomingTransfers } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

export function useTransfers() {
  const { user } = useAuthStore()
  const branchId = user?.branchId ?? 'branch1'

  return useQuery({
    queryKey: ['manager-transfers', branchId, isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        const outgoing = mockManagerTransfers.filter((t) => t.fromBranchId === branchId)
        const incoming = mockIncomingTransfers.filter((t) => t.toBranchId === branchId)
        return [...outgoing, ...incoming]
      }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get(`/manager/transfers?branchId=${branchId}`)
        return res.data ?? mockManagerTransfers
      } catch {
        return mockManagerTransfers
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
