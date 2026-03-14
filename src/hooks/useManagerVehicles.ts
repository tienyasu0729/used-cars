import { useQuery } from '@tanstack/react-query'
import { mockManagerVehicles } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'
import type { Vehicle } from '@/types'

export function useManagerVehicles() {
  const { user } = useAuthStore()
  const branchId = user?.branchId ?? 'branch1'

  return useQuery({
    queryKey: ['manager-vehicles', branchId, isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        return mockManagerVehicles.filter((v) => v.branchId === branchId)
      }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get(`/manager/vehicles?branchId=${branchId}`)
        return res.data?.data ?? mockManagerVehicles
      } catch {
        return mockManagerVehicles.filter((v) => v.branchId === branchId)
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}

export function useManagerVehicle(id: string | undefined) {
  const { data: vehicles, isLoading } = useManagerVehicles()
  const vehicle = vehicles?.find((v) => v.id === id) ?? null
  return { data: vehicle, isLoading } as { data: Vehicle | null; isLoading: boolean }
}
