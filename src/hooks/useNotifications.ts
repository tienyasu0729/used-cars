import { useQuery } from '@tanstack/react-query'
import { mockNotifications } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchNotifications() {
  if (isMockMode()) return mockNotifications
  try {
    const res = await fetch('/api/notifications')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockNotifications
    }
  } catch {}
  return mockNotifications
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', isMockMode()],
    queryFn: fetchNotifications,
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
