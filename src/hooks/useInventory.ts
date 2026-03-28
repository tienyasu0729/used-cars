import { useVehicles } from './useVehicles'
import { useAuthStore } from '@/store/authStore'

export function useInventory() {
  const { user } = useAuthStore()
  const { vehicles, ...rest } = useVehicles()
  const branchId = user?.branchId
  const inventory =
    branchId != null ? vehicles.filter((v) => v.branch_id === branchId) : vehicles
  const available = inventory.filter((v) => v.status === 'Available')

  return { data: inventory, available, ...rest }
}
