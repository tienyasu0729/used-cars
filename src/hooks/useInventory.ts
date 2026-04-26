import { useMemo } from 'react'
import { useVehicles } from './useVehicles'
import { useAuthStore } from '@/store/authStore'

export function useInventory() {
  const { user } = useAuthStore()
  const branchId = user?.branchId
  const hooks = useVehicles({
    managed: true,
    branchId: branchId ?? undefined,
    size: 500,
    sort: 'idDesc',
    page: 0,
  })
  const available = useMemo(
    () => hooks.vehicles.filter((v) => v.status === 'Available'),
    [hooks.vehicles]
  )
  return {
    data: hooks.vehicles,
    available,
    ...hooks,
  }
}
