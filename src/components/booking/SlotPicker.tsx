import type { AvailableSlot } from '@/types/booking.types'

interface SlotPickerProps {
  slots: AvailableSlot[]
  selectedSlotTime: string | null
  onSelect: (slotTime: string) => void
}

export function SlotPicker({ slots, selectedSlotTime, onSelect }: SlotPickerProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có khung giờ cho ngày / chi nhánh đã chọn.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((s) => {
        const full = s.availableCount <= 0
        const active = selectedSlotTime === s.slotTime
        return (
          <button
            key={s.slotTime}
            type="button"
            disabled={full}
            onClick={() => onSelect(s.slotTime)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              full
                ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                : active
                  ? 'border-[#1A3C6E] bg-[#1A3C6E] text-white'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-[#1A3C6E]/40'
            }`}
          >
            {s.slotTime} {full ? '(đầy)' : `(còn ${s.availableCount} chỗ)`}
          </button>
        )
      })}
    </div>
  )
}
