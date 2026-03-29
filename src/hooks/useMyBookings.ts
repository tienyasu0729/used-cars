import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import { isMockMode } from '@/config/dataSource'
import { mockBookings } from '@/mock/mockBookings'
import type { Booking } from '@/types/booking.types'

export function useMyBookings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['my-bookings', isMockMode()],
    queryFn: async (): Promise<Booking[]> => {
      if (isMockMode()) {
        return mockBookings
      }
      const r = await bookingService.getMyBookings({ page: 0, size: 100 })
      return r.items
    },
    staleTime: isMockMode() ? Infinity : 60_000,
  })

  const cancelBooking = useCallback(
    async (id: number) => {
      if (isMockMode()) {
        queryClient.setQueryData<Booking[]>(['my-bookings', true], (old) =>
          (old ?? []).map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)),
        )
        return
      }
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
