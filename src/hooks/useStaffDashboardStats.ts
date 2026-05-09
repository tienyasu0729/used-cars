import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getStaffStats } from '@/services/staffDashboard.service'

function canLoadStaffStats(user: ReturnType<typeof useAuthStore.getState>['user']): boolean {
  if (!user) return false
  if (user.role === 'Admin') return typeof user.branchId === 'number'
  return user.role === 'SalesStaff' || user.role === 'BranchManager'
}

export function useStaffDashboardStats() {
  const user = useAuthStore((s) => s.user)
  const branchId = typeof user?.branchId === 'number' ? user.branchId : undefined

  return useQuery({
    queryKey: ['staff-dashboard-stats', user?.role, branchId ?? 'ctx'],
    queryFn: () => getStaffStats(user?.role === 'Admin' ? branchId : undefined),
    enabled: canLoadStaffStats(user ?? null),
    staleTime: 60_000,
  })
}
