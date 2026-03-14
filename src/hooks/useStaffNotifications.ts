import { useQuery } from '@tanstack/react-query'
import { mockStaffNotifications } from '@/mock/mockStaffNotifications'
import { isMockMode } from '@/config/dataSource'

export function useStaffNotifications() {
  return useQuery({
    queryKey: ['staff-notifications', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockStaffNotifications
      try {
        const res = await fetch('/api/staff/notifications')
        if (res.ok) {
          const data = await res.json()
          return Array.isArray(data) ? data : data?.data ?? mockStaffNotifications
        }
      } catch {}
      return mockStaffNotifications
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
