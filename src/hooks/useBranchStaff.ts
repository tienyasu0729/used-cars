import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { managerStaffService } from '@/services/managerStaff.service'
import { staffDtoToTableRow } from '@/utils/managerStaffMapper'

export function useBranchStaff() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : undefined

  return useQuery({
    queryKey: ['branch-staff', branchId ?? 'all'],
    queryFn: async () => {
      const list = await managerStaffService.list()
      return list.map(staffDtoToTableRow)
    },
    staleTime: 1000 * 60 * 2,
  })
}
