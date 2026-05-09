import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getManagerStats } from '@/services/managerDashboard.service'

function canLoadManagerStats(user: ReturnType<typeof useAuthStore.getState>['user']): boolean {
  if (!user) return false
  if (user.role === 'Admin') return typeof user.branchId === 'number'
  return user.role === 'BranchManager'
}

export function useManagerDashboardStats() {
  const user = useAuthStore((s) => s.user)
  const branchId = typeof user?.branchId === 'number' ? user.branchId : undefined

  return useQuery({
    queryKey: ['manager-dashboard-stats', user?.role, branchId ?? 'ctx'],
    queryFn: () => getManagerStats(user?.role === 'Admin' ? branchId : undefined),
    enabled: canLoadManagerStats(user ?? null),
    staleTime: 60_000,
  })
}
