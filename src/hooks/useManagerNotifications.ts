import { useQuery } from '@tanstack/react-query'
import { mockManagerNotifications } from '@/mock/mockManagerNotifications'
import { isMockMode } from '@/config/dataSource'

export function useManagerNotifications() {
  return useQuery({
    queryKey: ['manager-notifications', isMockMode()],
    queryFn: async () => {
      // Backend not implemented for this endpoint yet, return mock to avoid 401/500 errors
      return mockManagerNotifications
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
