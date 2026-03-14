import { useQuery } from '@tanstack/react-query'
import { mockAdminLogs } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useActivityLogs() {
  return useQuery({
    queryKey: ['admin-logs', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminLogs
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/logs')
        return res.data ?? mockAdminLogs
      } catch {
        return mockAdminLogs
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
