import { useQuery } from '@tanstack/react-query'
import type { Notification } from '@/types'

/** Backend chưa có GET thông báo quản lý — trả rỗng. */
export function useManagerNotifications() {
  return useQuery({
    queryKey: ['manager-notifications'],
    queryFn: async () => [] as Notification[],
    staleTime: 1000 * 60,
  })
}
