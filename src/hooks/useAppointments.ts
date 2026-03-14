import { useQuery } from '@tanstack/react-query'
import { mockAppointments } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'

export function useAppointments() {
  const { user } = useAuthStore()
  const branchId = user?.branchId ?? 'branch1'

  return useQuery({
    queryKey: ['manager-appointments', branchId, isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        return mockAppointments
      }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get(`/manager/appointments?branchId=${branchId}`)
        return res.data ?? mockAppointments
      } catch {
        return mockAppointments
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
