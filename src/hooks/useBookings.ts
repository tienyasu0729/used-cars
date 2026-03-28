import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import { mockBookings } from '@/mock/mockBookings'
import { isMockMode } from '@/config/dataSource'
import type { Booking } from '@/types/booking.types'

/**
 * Danh sách booking của customer (tất cả trạng thái) — dùng sidebar / dashboard.
 * Trang BookingsPage dùng {@link useMyBookings} để lọc tab.
 */
export function useBookings() {
  return useQuery({
    queryKey: ['my-bookings', 'all', isMockMode()],
    queryFn: async (): Promise<Booking[]> => {
      if (isMockMode()) {
        return mockBookings
      }
      const r = await bookingService.getMyBookings({ page: 0, size: 100 })
      return r.items
    },
    staleTime: isMockMode() ? Infinity : 60_000,
  })
}
