import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

const HEARTBEAT_MS = 45_000

/**
 * Định kỳ gọi GET /users/me — nếu tài khoản bị khóa, JWT filter trả ACCOUNT_SUSPENDED
 * và axios interceptor mở modal chặn (kể cả khi user không gửi request khác).
 */
export function useAccountStatusHeartbeat() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const enabled =
    isAuthenticated && (user?.role === 'SalesStaff' || user?.role === 'BranchManager')

  return useQuery({
    queryKey: ['account-status-heartbeat'],
    queryFn: async () => {
      const { api } = await import('@/services/apiClient')
      await api.get('/users/me')
      return true
    },
    enabled,
    refetchInterval: HEARTBEAT_MS,
    refetchIntervalInBackground: true,
    retry: false,
    staleTime: HEARTBEAT_MS,
  })
}
