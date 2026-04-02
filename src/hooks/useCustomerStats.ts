import { useQuery } from '@tanstack/react-query'
import { getMyStats } from '@/services/user.service'
import { useAuthStore } from '@/store/authStore'

export function useCustomerStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: getMyStats,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}
