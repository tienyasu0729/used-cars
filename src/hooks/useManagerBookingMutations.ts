import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'

export function useManagerBookingMutations(_branchId: number) {
  const queryClient = useQueryClient()
  const [actionBookingId, setActionBookingId] = useState<number | null>(null)

  const confirmBooking = useCallback(
    async (bookingId: number) => {
      setActionBookingId(bookingId)
      try {
        await bookingService.confirmBooking(bookingId)
        await queryClient.invalidateQueries({ queryKey: ['manager-appointments'] })
        await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] })
      } finally {
        setActionBookingId(null)
      }
    },
    [queryClient],
  )

  const cancelBooking = useCallback(
    async (bookingId: number) => {
      setActionBookingId(bookingId)
      try {
        await bookingService.cancelBooking(bookingId)
        await queryClient.invalidateQueries({ queryKey: ['manager-appointments'] })
        await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] })
      } finally {
        setActionBookingId(null)
      }
    },
    [queryClient],
  )

  return { confirmBooking, cancelBooking, actionBookingId }
}
