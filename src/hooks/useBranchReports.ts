import { useQuery } from '@tanstack/react-query'
import { mockBranchReports } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

export function useBranchReports() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : 1

  return useQuery({
    queryKey: ['branch-reports', branchId, isMockMode()],
    queryFn: async () => {
      // Tier 4 (Reports) is not fully implemented yet for the manager dashboard
      // Return mock data for now to prevent 500 API errors
      return mockBranchReports
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}
