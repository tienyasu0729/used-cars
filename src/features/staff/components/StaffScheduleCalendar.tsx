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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const monOffset = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + monOffset)
    return d
  })
  const [monthRef, setMonthRef] = useState(() => new Date())
  const days = getWeekDays(weekStart)
  const todayStr = new Date().toISOString().slice(0, 10)

  function getMonthDays(ref: Date) {
    const year = ref.getFullYear()
    const month = ref.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startPad = (first.getDay() + 6) % 7
    const days: (Date | null)[] = Array(startPad).fill(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    while (days.length < 42) days.push(null)
    return days
  }
  const monthDays = getMonthDays(monthRef)

  const navPrev = () => {
    if (viewMode === 'week') setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x })
    else setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }
  const navNext = () => {
    if (viewMode === 'week') setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() + 7); return x })
    else setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1))
  }
  const displayDate = viewMode === 'week' ? weekStart : monthRef

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
          <button onClick={navPrev} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] text-center font-medium text-slate-700">{formatMonthYear(displayDate)}</span>
          <button onClick={navNext} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${viewMode === 'week' ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setViewMode('week')}
          >
            Tuần
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${viewMode === 'month' ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setViewMode('month')}
          >
            Tháng
          </button>
          {onAddAppointment && (
            <button onClick={onAddAppointment} className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#153058]">
              <Plus className="h-4 w-4" />
              Thêm lịch hẹn
            </button>
          )}
        </div>
      </div>
      {viewMode === 'week' ? (
      <div className="overflow-x-auto">
        <div className="flex min-w-[600px] border border-slate-200">
          <div className="w-14 shrink-0 border-r border-slate-200 bg-slate-50 py-2">
            <div className="px-1 text-center text-xs font-bold uppercase text-slate-500">GIỜ</div>
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
      ) : (
        <div className="grid grid-cols-7 border border-slate-200">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h) => (
            <div key={h} className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-bold text-slate-600 last:border-r-0">
              {h}
            </div>
          ))}
          {monthDays.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[80px] border-b border-r border-slate-100 bg-slate-50/50 last:border-r-0" />
            const dateStr = d.toISOString().slice(0, 10)
            const events = getEventsForDay(d)
            const isToday = dateStr === todayStr
            return (
              <div key={i} className={`min-h-[80px] border-b border-r border-slate-100 p-1 last:border-r-0 ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-[#1A3C6E]' : 'text-slate-600'}`}>{d.getDate()}</span>
                <div className="mt-1 space-y-0.5">
                  {events.slice(0, 3).map((item) => (
                    <div key={item.id} className={`truncate rounded px-1 py-0.5 text-[10px] ${TYPE_COLORS[item.type] || TYPE_COLORS.meeting}`}>
                      {item.timeSlot} {TYPE_LABELS[item.type]}
                    </div>
                  ))}
                  {events.length > 3 && <span className="text-[10px] text-slate-400">+{events.length - 3}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
