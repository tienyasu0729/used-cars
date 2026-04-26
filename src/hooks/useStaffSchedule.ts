import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { bookingService } from '@/services/booking.service'

/** Lịch nhân viên theo ngày — GET /staff/schedule (cùng booking.service). */
export function useStaffSchedule(dateIso?: string) {
  const { user } = useAuthStore()
  const branchId = user?.branchId
  const day = dateIso ?? new Date().toISOString().slice(0, 10)

  return useQuery({
    queryKey: ['staffSchedule', branchId, day],
    queryFn: async () => {
      if (branchId == null) return []
      return bookingService.getStaffSchedule(branchId, day)
    },
    enabled: branchId != null,
    staleTime: 60_000,
  })
}
