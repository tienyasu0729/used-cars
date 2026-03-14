import { useBookings } from './useBookings'
import { useAuthStore } from '@/store/authStore'

export function useStaffBookings() {
  const { user } = useAuthStore()
  const { data, ...rest } = useBookings()
  const branchId = user?.branchId

  const filtered = branchId && data
    ? data.filter((b) => b.branchId === branchId)
    : data ?? []

  return { data: filtered, ...rest }
}
