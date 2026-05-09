import { useQuery } from '@tanstack/react-query'
import { fetchAdminDashboardStats } from '@/services/adminDashboard.service'

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchAdminDashboardStats,
    staleTime: 60_000,
  })
}
