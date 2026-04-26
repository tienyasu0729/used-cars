import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/adminApi'

export function useAdminPermissions() {
  return useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => adminApi.listPermissions(),
    staleTime: 1000 * 60 * 10,
  })
}
