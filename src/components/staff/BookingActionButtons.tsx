import { useState } from 'react'
import type { Booking } from '@/types/booking.types'
import { ConfirmDialog } from '@/components/ui'

interface BookingActionButtonsProps {
  booking: Booking
  onConfirm: (id: number, note?: string) => Promise<void>
  onReschedule: (id: number, body: { newBookingDate: string; newTimeSlot: string; note?: string }) => Promise<void>
  onComplete: (id: number) => Promise<void>
  onCancel: (id: number) => Promise<void>
}

export function BookingActionButtons({
  booking,
  onConfirm,
  onReschedule,
  onComplete,
  onCancel,
}: BookingActionButtonsProps) {
  const [busy, setBusy] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [newDate, setNewDate] = useState(booking.bookingDate)
  const [newTime, setNewTime] = useState(booking.timeSlot)
  const [resNote, setResNote] = useState('')

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
      setShowReschedule(false)
    } finally {
      setBusy(false)
    }
  }

  const s = booking.status

  if (s === 'Cancelled' || s === 'Completed') {
    return null
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {s === 'Pending' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onConfirm(booking.id, 'Xác nhận từ staff'))}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Xác nhận
          </button>
        )}
        {s === 'Rescheduled' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onConfirm(booking.id, 'Xác nhận lại sau đổi lịch'))}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Xác nhận lại
          </button>
        )}
        {(s === 'Pending' || s === 'Confirmed' || s === 'Rescheduled') && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowReschedule((v) => !v)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đổi lịch
          </button>
        )}
        {s === 'Confirmed' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onComplete(booking.id))}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Hoàn thành
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => setCancelConfirmOpen(true)}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Hủy
        </button>
      </div>

      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        title="Hủy lịch hẹn"
        message="Bạn có chắc muốn hủy lịch hẹn này?"
        confirmLabel="Hủy lịch"
        onConfirm={async () => {
          await run(() => onCancel(booking.id))
          setCancelConfirmOpen(false)
        }}
      />

      {showReschedule && (
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 p-3 text-left">
          <p className="mb-2 text-xs font-semibold text-slate-700">Đổi ngày & giờ</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded border px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="HH:mm"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-24 rounded border px-2 py-1 text-sm"
            />
          </div>
          <input
            placeholder="Ghi chú"
            value={resNote}
            onChange={(e) => setResNote(e.target.value)}
            className="mt-2 w-full rounded border px-2 py-1 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  onReschedule(booking.id, {
                    newBookingDate: newDate,
                    newTimeSlot: newTime.trim(),
                    note: resNote.trim() || undefined,
                  })
                )
              }
              className="rounded bg-[#1A3C6E] px-3 py-1 text-sm text-white"
            >
              Lưu đổi lịch
            </button>
            <button type="button" onClick={() => setShowReschedule(false)} className="text-sm text-slate-600">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
