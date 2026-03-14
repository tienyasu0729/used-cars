import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { StaffScheduleItem } from '@/mock/mockStaffSchedule'

const HOUR_HEIGHT = 36
const START_HOUR = 8
const END_HOUR = 18
const TOTAL_HEIGHT = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT

const TYPE_COLORS: Record<string, string> = {
  test_drive: 'bg-blue-200 border-blue-300 text-blue-900',
  consultation: 'bg-orange-200 border-orange-300 text-orange-900',
  contract: 'bg-orange-200 border-orange-300 text-orange-900',
  meeting: 'bg-slate-200 border-slate-300 text-slate-700',
  handover: 'bg-slate-200 border-slate-300 text-slate-700',
}

const TYPE_LABELS: Record<string, string> = {
  test_drive: 'Lái thử',
  consultation: 'Tư vấn',
  contract: 'Ký hợp đồng',
  meeting: 'Họp nhóm',
  handover: 'Bàn giao',
}

function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h + (m || 0) / 60
}

function getWeekDays(ref: Date) {
  const d = new Date(ref)
  const day = d.getDay()
  const monOffset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + monOffset)
  return Array.from({ length: 6 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return x
  })
}

function formatMonthYear(d: Date) {
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  return `${months[d.getMonth()]}, ${d.getFullYear()}`
}

interface StaffScheduleCalendarProps {
  schedule: StaffScheduleItem[]
  onAddAppointment?: () => void
}

export function StaffScheduleCalendar({ schedule, onAddAppointment }: StaffScheduleCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const monOffset = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + monOffset)
    return d
  })
  const days = getWeekDays(weekStart)
  const todayStr = new Date().toISOString().slice(0, 10)

  const getEventsForDay = (d: Date) => {
    const dateStr = d.toISOString().slice(0, 10)
    return schedule.filter((s) => s.date === dateStr)
  }

  const getEventStyle = (item: StaffScheduleItem) => {
    const start = parseTime(item.timeSlot) - START_HOUR
    const endTime = item.endTime || item.timeSlot
    const end = parseTime(endTime) - START_HOUR
    const duration = Math.max(0.25, end - start)
    return {
      top: `${start * HOUR_HEIGHT + 2}px`,
      height: `${duration * HOUR_HEIGHT - 4}px`,
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x })} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] text-center font-medium text-slate-700">{formatMonthYear(weekStart)}</span>
          <button onClick={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() + 7); return x })} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[#1A3C6E] px-3 py-1.5 text-sm font-medium text-white">Tuần</span>
          <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500">Tháng</span>
          {onAddAppointment && (
            <button onClick={onAddAppointment} className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#153058]">
              <Plus className="h-4 w-4" />
              Thêm lịch hẹn
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[600px] border border-slate-200">
          <div className="w-14 shrink-0 border-r border-slate-200 bg-slate-50 py-2">
            <div className="px-1 text-center text-xs font-bold uppercase text-slate-500">Giờ</div>
            <div className="mt-2">
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                <div key={i} className="flex justify-end pr-1 text-xs text-slate-400" style={{ height: HOUR_HEIGHT }}>
                  {String(START_HOUR + i).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-1">
            {days.map((d) => (
              <div key={d.toISOString()} className={`relative min-w-0 flex-1 border-r border-slate-200 last:border-r-0 ${d.toISOString().slice(0, 10) === todayStr ? 'bg-blue-50/30' : ''}`}>
                <div className="border-b border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-600">
                  Thứ {d.getDay() + 1} {d.getDate()}
                </div>
                <div className="relative" style={{ height: TOTAL_HEIGHT }}>
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <div key={i} className="border-b border-slate-100" style={{ height: HOUR_HEIGHT }} />
                  ))}
                  {getEventsForDay(d).map((item) => (
                    <div
                      key={item.id}
                      className={`absolute left-1 right-1 overflow-hidden rounded border px-2 py-1 text-xs ${TYPE_COLORS[item.type] || TYPE_COLORS.meeting}`}
                      style={getEventStyle(item)}
                    >
                      <p className="font-medium">{TYPE_LABELS[item.type]}</p>
                      <p className="truncate">{item.customerName} - {item.vehicleName || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
