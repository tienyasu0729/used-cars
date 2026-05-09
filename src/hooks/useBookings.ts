import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import type { Booking } from '@/types/booking.types'

/**
 * Cùng cache với {@link useMyBookings} (một request, invalidate sau POST/hủy).
 */
export function useBookings() {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async (): Promise<Booking[]> => {
      const r = await bookingService.getMyBookings({ page: 0, size: 100 })
      return r.items
    },
    staleTime: 60_000,
  })
}
