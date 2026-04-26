import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import type { Booking } from '@/types/booking.types'

/**
 * Luôn GET /bookings (JWT). Không dùng mock theo VITE_DATA_SOURCE — POST đặt lịch luôn API,
 * nếu mock danh sách sẽ không bao giờ có lịch vừa tạo.
 */
export function useMyBookings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async (): Promise<Booking[]> => {
      const r = await bookingService.getMyBookings({ page: 0, size: 100 })
      return r.items
    },
    staleTime: 60_000,
  })

  const cancelBooking = useCallback(
    async (id: number) => {
      await bookingService.cancelBooking(id)
      await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    [queryClient],
  )

  return {
    bookings: query.data ?? [],
    totalPages: 1,
    isLoading: query.isLoading,
    isError: query.isError,
    cancelBooking,
    refetch: query.refetch,
  }
}
