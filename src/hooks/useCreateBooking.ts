import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingService } from '@/services/booking.service'
import type { CreateBookingRequest } from '@/types/booking.types'
import type { ApiErrorResponse } from '@/types/auth.types'

export function useCreateBooking() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBooking = async (data: CreateBookingRequest) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await bookingService.createBooking(data)
      navigate('/dashboard/bookings')
    } catch (e) {
      const err = e as ApiErrorResponse & { message?: string }
      if (err.errorCode === 'SLOT_FULLY_BOOKED') {
        setError(err.message ?? 'Giờ này đã đầy, vui lòng chọn giờ khác')
      } else if (err.errorCode === 'VEHICLE_NOT_AVAILABLE') {
        setError(err.message ?? 'Xe này hiện không thể đặt lịch')
      } else {
        setError(err.message ?? 'Không thể đặt lịch. Vui lòng thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createBooking, isSubmitting, error, setError }
}
