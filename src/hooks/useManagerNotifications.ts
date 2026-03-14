import { useQuery } from '@tanstack/react-query'
import { mockManagerNotifications } from '@/mock/mockManagerNotifications'
import { isMockMode } from '@/config/dataSource'

export function useManagerNotifications() {
  return useQuery({
    queryKey: ['manager-notifications', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockManagerNotifications
      try {
        const res = await fetch('/api/manager/notifications')
        if (res.ok) {
          const data = await res.json()
          return Array.isArray(data) ? data : data?.data ?? mockManagerNotifications
        }
      } catch {}
      return mockManagerNotifications
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
