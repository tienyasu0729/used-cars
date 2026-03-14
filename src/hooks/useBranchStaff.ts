import { useQuery } from '@tanstack/react-query'
import { mockStaffMembers } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

export function useBranchStaff() {
  const { user } = useAuthStore()
  const branchId = user?.branchId ?? 'branch1'

  return useQuery({
    queryKey: ['branch-staff', branchId, isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        return mockStaffMembers.filter((s) => s.branchId === branchId)
      }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get(`/manager/staff?branchId=${branchId}`)
        return res.data ?? mockStaffMembers
      } catch {
        return mockStaffMembers.filter((s) => s.branchId === branchId)
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}
