import { useEffect, useMemo, useState } from 'react'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { useCreateBooking } from '@/hooks/useCreateBooking'
import { normalizeTimeSlot } from '@/services/booking.service'
import type { AvailableSlot } from '@/types/booking.types'
import { SlotPicker } from './SlotPicker'

interface BookingFormProps {
  vehicleId: number
  branchId: number
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function toYmdLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isClosedOrOutside(slot: AvailableSlot): boolean {
  return slot.unavailableReason === 'BRANCH_CLOSED' || slot.unavailableReason === 'OUTSIDE_WORKING_HOURS'
}

export function BookingForm({ vehicleId, branchId }: BookingFormProps) {
  const { slots, isLoading, fetchSlots } = useAvailableSlots()
  const { createBooking, isSubmitting, error, errorCode, setError } = useCreateBooking()

  const today = useMemo(() => new Date(), [])
  const min = useMemo(() => toYmdLocal(today), [today])
  const max = useMemo(() => toYmdLocal(addDays(today, 30)), [today])

  const [bookingDate, setBookingDate] = useState(() => toYmdLocal(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    void fetchSlots(branchId, bookingDate, vehicleId)
  }, [branchId, bookingDate, vehicleId, fetchSlots])

  useEffect(() => {
    setSelectedSlot(null)
  }, [bookingDate, branchId])

  useEffect(() => {
    if (!errorCode) return
    const shouldRefresh = ['SLOT_FULLY_BOOKED', 'VEHICLE_SLOT_TAKEN', 'LISTING_ID_CONFLICT', 'SLOT_NOT_FOUND'].includes(errorCode)
    if (shouldRefresh) {
      void fetchSlots(branchId, bookingDate, vehicleId)
    }
  }, [errorCode, branchId, bookingDate, vehicleId, fetchSlots])

  const closedForDay = slots.length > 0 && slots.every(isClosedOrOutside)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (closedForDay) {
      setError('Chi nhánh không làm việc vào ngày hoặc khung giờ này. Vui lòng chọn ngày khác.')
      return
    }
    if (!selectedSlot) {
      setError('Vui lòng chọn khung giờ.')
      return
    }
    const fresh = await fetchSlots(branchId, bookingDate, vehicleId)
    const picked = fresh.find(
      (s) => normalizeTimeSlot(s.slotTime) === normalizeTimeSlot(selectedSlot),
    )
    if (!picked || !picked.isBookable || picked.availableCount <= 0) {
      setError('Khung giờ này vừa hết chỗ. Vui lòng chọn giờ khác.')
      return
    }
    await createBooking({
      vehicleId,
      branchId,
      bookingDate,
      timeSlot: selectedSlot,
      note: note.trim() || undefined,
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Ngày hẹn</label>
        <input
          type="date"
          min={min}
          max={max}
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Khung giờ</p>
        {isLoading ? (
          <p className="text-sm text-slate-500">Đang tải slot...</p>
        ) : closedForDay ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Chi nhánh không làm việc vào ngày này hoặc ngoài giờ nhận lái thử.
          </div>
        ) : (
          <SlotPicker slots={slots} selectedSlotTime={selectedSlot} onSelect={setSelectedSlot} />
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Yêu cầu đặc biệt (tuỳ chọn)"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || closedForDay}
        className="w-full rounded-lg bg-[#1A3C6E] py-3 font-bold text-white hover:bg-[#15325A] disabled:opacity-60"
      >
        {isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
      </button>
    </form>
  )
}
