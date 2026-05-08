import type { BookingStatus } from '@/types/booking.types'

const STYLES: Record<BookingStatus, { className: string; label: string }> = {
  AwaitingContract: { className: 'bg-violet-100 text-violet-800 border-violet-200', label: 'Chờ ký hợp đồng' },
  Pending: { className: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Chờ xác nhận' },
  Confirmed: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Đã xác nhận' },
  Rescheduled: { className: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Đổi lịch' },
  Completed: { className: 'bg-sky-100 text-sky-800 border-sky-200', label: 'Hoàn thành' },
  NoShow: { className: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Khách không đến' },
  Cancelled: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Đã hủy' },
}

export function BookingStatusBadge({ status }: { status: string }) {
  const cfg = STYLES[status as BookingStatus] ?? {
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    label: status,
  }
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
