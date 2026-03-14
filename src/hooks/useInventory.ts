import { useVehicles } from './useVehicles'
import { useAuthStore } from '@/store/authStore'

export function useInventory() {
  const { user } = useAuthStore()
  const { data: vehiclesData, ...rest } = useVehicles()
  const branchId = user?.branchId
  const allVehicles = vehiclesData?.data ?? []

  const inventory = branchId ? allVehicles.filter((v) => v.branchId === branchId) : allVehicles
  const available = inventory.filter((v) => v.status === 'Available')

  return { data: inventory, available, ...rest }
}
