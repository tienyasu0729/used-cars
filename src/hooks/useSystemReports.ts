import { useQuery } from '@tanstack/react-query'
import { mockAdminReports } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useSystemReports() {
  return useQuery({
    queryKey: ['admin-reports', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminReports
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/reports')
        return res.data ?? mockAdminReports
      } catch {
        return mockAdminReports
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
