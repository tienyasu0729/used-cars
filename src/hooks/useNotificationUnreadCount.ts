import { useQuery } from '@tanstack/react-query'
import { isApiMode } from '@/config/dataSource'
import { fetchInboxUnreadCount, inboxNotificationsUnreadKey } from '@/services/inboxNotifications.service'

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: [...inboxNotificationsUnreadKey],
    queryFn: async () => {
      if (!isApiMode()) return 0
      return fetchInboxUnreadCount()
    },
    staleTime: 30_000,
  })
}
