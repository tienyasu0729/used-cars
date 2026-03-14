import { useQuery } from '@tanstack/react-query'
import { mockAdminUsers } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminUsers
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/users')
        return res.data ?? mockAdminUsers
      } catch {
        return mockAdminUsers
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
