import { useQuery } from '@tanstack/react-query'
import { isApiMode } from '@/config/dataSource'
import type { Notification } from '@/types'
import { fetchInboxNotifications, inboxNotificationsListKey } from '@/services/inboxNotifications.service'

export function useNotifications() {
  return useQuery({
    queryKey: [...inboxNotificationsListKey],
    queryFn: async () => {
      if (!isApiMode()) return [] as Notification[]
      const { items } = await fetchInboxNotifications(0, 200)
      return items
    },
    staleTime: 60_000,
  })
}
