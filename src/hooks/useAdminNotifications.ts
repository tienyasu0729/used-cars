import { useQuery } from '@tanstack/react-query'
import { isApiMode } from '@/config/dataSource'
import { adminAnnouncementsListKey, fetchAdminAnnouncements, type AdminAnnouncementRow } from '@/services/adminAnnouncements.service'

export function useAdminNotifications() {
  return useQuery({
    queryKey: [...adminAnnouncementsListKey],
    queryFn: async () => {
      if (!isApiMode()) return [] as AdminAnnouncementRow[]
      const { items } = await fetchAdminAnnouncements(0, 100)
      return items
    },
    staleTime: 60_000,
  })
}
