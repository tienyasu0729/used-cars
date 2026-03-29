import { useCallback, useEffect, useState } from 'react'
import { bookingService } from '@/services/booking.service'
import type { AvailableSlot } from '@/types/booking.types'
import { isMockMode } from '@/config/dataSource'

export function useAvailableSlots() {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSlots = useCallback(async (branchId: number | undefined, date: string | undefined) => {
    if (branchId == null || !date) {
      setSlots([])
      return []
    }
    if (isMockMode()) {
      const mock = [
        { slotTime: '09:00', availableCount: 2, maxBookings: 3 },
        { slotTime: '10:00', availableCount: 3, maxBookings: 3 },
        { slotTime: '14:00', availableCount: 1, maxBookings: 3 },
      ]
      setSlots(mock)
      return mock
    }
    setIsLoading(true)
    try {
      const data = await bookingService.getAvailableSlots(branchId, date)
      setSlots(data)
      return data
    } catch {
      setSlots([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => setSlots([])
  }, [])

  return { slots, isLoading, fetchSlots }
}
