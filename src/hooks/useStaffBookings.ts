import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { bookingService } from '@/services/booking.service'
import { mockBookings } from '@/mock/mockBookings'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types/auth.types'
import type { Booking } from '@/types/booking.types'

function resolveBranchId(user: UserProfile | null): number {
  const u = user as UserProfile & { branchId?: number }
  return u?.branchId ?? 1
}

export function useStaffBookings() {
  const { user } = useAuthStore()
  const branchId = resolveBranchId(user)
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  const bookingsQuery = useQuery({
    queryKey: ['staff-bookings', branchId, isMockMode()],
    queryFn: async (): Promise<Booking[]> => {
      if (isMockMode()) {
        return mockBookings.filter((b) => b.branchId === branchId)
      }
      const page = await bookingService.getStaffBookings({ branchId, page: 0, size: 200 })
      return page.items
    },
    staleTime: isMockMode() ? Infinity : 60_000,
  })

  const scheduleQuery = useQuery({
    queryKey: ['staff-schedule', branchId, selectedDate, isMockMode()],
    queryFn: () => {
      if (isMockMode()) {
        return Promise.resolve([])
      }
      return bookingService.getStaffSchedule(branchId, selectedDate)
    },
    staleTime: isMockMode() ? Infinity : 60_000,
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['staff-bookings'] })
    queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
  }, [queryClient])

  const confirmBooking = useCallback(
    async (id: number, note?: string) => {
      await bookingService.confirmBooking(id, note)
      invalidate()
    },
    [invalidate]
  )

  const rescheduleBooking = useCallback(
    async (id: number, body: import('@/types/booking.types').RescheduleRequest) => {
      await bookingService.rescheduleBooking(id, body)
      invalidate()
    },
    [invalidate]
  )

  const completeBooking = useCallback(
    async (id: number) => {
      await bookingService.completeBooking(id)
      invalidate()
    },
    [invalidate]
  )

  const cancelBooking = useCallback(
    async (id: number) => {
      await bookingService.cancelBooking(id)
      invalidate()
    },
    [invalidate]
  )

  return {
    bookings: bookingsQuery.data ?? [],
    schedule: scheduleQuery.data ?? [],
    isLoading: bookingsQuery.isLoading || scheduleQuery.isLoading,
    selectedDate,
    setSelectedDate,
    confirmBooking,
    rescheduleBooking,
    completeBooking,
    cancelBooking,
    refetch: bookingsQuery.refetch,
  }
}
