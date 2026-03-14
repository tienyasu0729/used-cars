import { useQuery } from '@tanstack/react-query'
import { mockBranchReports } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

export function useBranchReports() {
  const { user } = useAuthStore()
  const branchId = user?.branchId ?? 'branch1'

  return useQuery({
    queryKey: ['branch-reports', branchId, isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        return mockBranchReports
      }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get(`/manager/reports?branchId=${branchId}`)
        return res.data ?? mockBranchReports
      } catch {
        return mockBranchReports
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}
