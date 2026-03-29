import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import { isMockMode } from '@/config/dataSource'
import type { ManagerAppointment } from '@/mock/mockManagerData'

export function useManagerBookingMutations(branchId: number) {
  const queryClient = useQueryClient()
  const [actionBookingId, setActionBookingId] = useState<number | null>(null)

  const patchMockRow = useCallback(
    (bookingId: number, patch: Partial<ManagerAppointment>) => {
      queryClient.setQueryData<ManagerAppointment[]>(
        ['manager-appointments', branchId, true],
        (old) =>
          (old ?? []).map((row) =>
            Number(row.id) === bookingId ? { ...row, ...patch } : row,
          ),
      )
    },
    [branchId, queryClient],
  )

  const confirmBooking = useCallback(
    async (bookingId: number) => {
      setActionBookingId(bookingId)
      try {
        if (isMockMode()) {
          patchMockRow(bookingId, { status: 'Confirmed' })
          return
        }
        await bookingService.confirmBooking(bookingId)
        await queryClient.invalidateQueries({ queryKey: ['manager-appointments'] })
        await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] })
      } finally {
        setActionBookingId(null)
      }
    },
    [patchMockRow, queryClient],
  )

  const cancelBooking = useCallback(
    async (bookingId: number) => {
      setActionBookingId(bookingId)
      try {
        if (isMockMode()) {
          patchMockRow(bookingId, { status: 'Cancelled' })
          return
        }
        await bookingService.cancelBooking(bookingId)
        await queryClient.invalidateQueries({ queryKey: ['manager-appointments'] })
        await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] })
      } finally {
        setActionBookingId(null)
      }
    },
    [patchMockRow, queryClient],
  )

  return { confirmBooking, cancelBooking, actionBookingId }
}
