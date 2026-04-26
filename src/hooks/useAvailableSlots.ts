import { useCallback, useEffect, useState } from 'react'
import { bookingService } from '@/services/booking.service'
import type { AvailableSlot } from '@/types/booking.types'

/**
 * Luôn gọi GET /bookings/available-slots (không dùng mock theo VITE_DATA_SOURCE).
 * POST đặt lịch luôn đi backend; nếu mock slot cố định sẽ lệch server (hiện “còn chỗ” nhưng 400).
 */
export function useAvailableSlots() {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSlots = useCallback(
    async (branchId: number | undefined, date: string | undefined, vehicleId?: number) => {
    if (branchId == null || !date) {
      setSlots([])
      return []
    }
    setIsLoading(true)
    try {
      const data = await bookingService.getAvailableSlots(branchId, date, vehicleId)
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
