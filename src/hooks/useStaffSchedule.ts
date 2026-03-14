import { useQuery } from '@tanstack/react-query'
import { mockStaffSchedule } from '@/mock'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

async function fetchStaffSchedule(branchId?: string) {
  if (isMockMode()) {
    if (branchId) {
      return mockStaffSchedule.filter((s) => s.branchId === branchId)
    }
    return mockStaffSchedule
  }
  try {
    const res = await fetch(`/api/staff/schedule${branchId ? `?branchId=${branchId}` : ''}`)
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockStaffSchedule
    }
  } catch {}
  return mockStaffSchedule
}

export function useStaffSchedule() {
  const { user } = useAuthStore()
  const branchId = user?.branchId

  return useQuery({
    queryKey: ['staffSchedule', branchId, isMockMode()],
    queryFn: () => fetchStaffSchedule(branchId),
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
