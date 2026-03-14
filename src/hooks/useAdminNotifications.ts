import { useQuery } from '@tanstack/react-query'
import { mockAdminNotifications } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin-notifications', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminNotifications
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/notifications')
        return res.data ?? mockAdminNotifications
      } catch {
        return mockAdminNotifications
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
