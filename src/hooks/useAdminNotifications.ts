import { useQuery } from '@tanstack/react-query'
import { isMockMode } from '@/config/dataSource'

const mockAdminNotifications = [
  { id: '1', title: 'Yêu cầu duyệt User mới', message: 'Có 3 tài khoản nhân viên mới chờ duyệt.', type: 'warning', read: false, createdAt: new Date().toISOString() },
]

export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin-notifications', isMockMode()],
    queryFn: async () => {
      // Backend not implemented for this endpoint yet, return mock to avoid errors
      return mockAdminNotifications
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
