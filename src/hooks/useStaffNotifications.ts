import { useQuery } from '@tanstack/react-query'
import type { Notification } from '@/types'

/** Backend chưa có endpoint thông báo staff — trả rỗng. */
export function useStaffNotifications() {
  return useQuery({
    queryKey: ['staff-notifications'],
    queryFn: async () => [] as Notification[],
    staleTime: 1000 * 60,
  })
}
