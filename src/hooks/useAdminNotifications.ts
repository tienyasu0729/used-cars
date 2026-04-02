import { useQuery } from '@tanstack/react-query'

type AdminNotifRow = { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }

/** Backend chưa có GET thông báo admin — trả rỗng. */
export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => [] as AdminNotifRow[],
    staleTime: 1000 * 60,
  })
}
