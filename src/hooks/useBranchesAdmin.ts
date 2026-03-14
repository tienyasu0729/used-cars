import { useQuery } from '@tanstack/react-query'
import { mockAdminBranches } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useBranchesAdmin() {
  return useQuery({
    queryKey: ['admin-branches', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminBranches
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/branches')
        return res.data ?? mockAdminBranches
      } catch {
        return mockAdminBranches
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
