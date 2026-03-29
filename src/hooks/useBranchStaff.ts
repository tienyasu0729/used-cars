import { useQuery } from '@tanstack/react-query'
import { mockStaffMembers } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

export function useBranchStaff() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : 1

  return useQuery({
    queryKey: ['branch-staff', branchId, isMockMode()],
    queryFn: async () => {
      // Backend not implemented for this endpoint yet, return mock to avoid 500 error
      return mockStaffMembers
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}
