import { useQuery } from '@tanstack/react-query'
import { mockAdminRoles } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useRoles() {
  return useQuery({
    queryKey: ['admin-roles', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockAdminRoles
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/roles')
        return res.data ?? mockAdminRoles
      } catch {
        return mockAdminRoles
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
