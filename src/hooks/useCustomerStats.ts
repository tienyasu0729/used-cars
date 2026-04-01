import { useQuery } from '@tanstack/react-query'
import { fetchCustomerStats } from '@/services/userProfile.service'
import { useAuthStore } from '@/store/authStore'

export function useCustomerStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: fetchCustomerStats,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}
