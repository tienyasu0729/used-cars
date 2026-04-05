import { useQuery } from '@tanstack/react-query'
import { isApiMode } from '@/config/dataSource'
import { fetchInboxUnreadCount, inboxNotificationsUnreadKey } from '@/services/inboxNotifications.service'
import { useAuthStore } from '@/store/authStore'

export function useNotificationUnreadCount() {
  const hasSession = useAuthStore((s) => !!s.token)
  const enabled = isApiMode() && hasSession
  return useQuery({
    queryKey: [...inboxNotificationsUnreadKey],
    queryFn: async () => {
      if (!enabled) return 0
      return fetchInboxUnreadCount()
    },
    staleTime: 30_000,
    refetchInterval: enabled ? 30_000 : false,
    enabled,
  })
}
