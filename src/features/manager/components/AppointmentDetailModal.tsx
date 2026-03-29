import { Modal } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { ManagerAppointment } from '@/mock/mockManagerData'

interface AppointmentDetailModalProps {
  appointment: ManagerAppointment | null
  isOpen: boolean
  onClose: () => void
  onConfirm?: (bookingId: number) => void | Promise<void>
  onCancelBooking?: (bookingId: number) => void | Promise<void>
  actionBookingId?: number | null
}

function canManagerConfirm(status: string): boolean {
  return status === 'Pending' || status === 'Rescheduled'
}

function canManagerCancel(status: string): boolean {
  return status === 'Pending' || status === 'Confirmed' || status === 'Rescheduled'
}

export function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  onCancelBooking,
  actionBookingId,
}: AppointmentDetailModalProps) {
  if (!appointment) return null

  const numericId = Number(appointment.id)
  const isBusy = actionBookingId === numericId

  const statusVariant =
    appointment.status === 'Confirmed'
      ? 'confirmed'
      : appointment.status === 'Pending' || appointment.status === 'Rescheduled'
        ? 'pending'
        : 'default'

  const statusLabels: Record<string, string> = {
    Confirmed: 'Đã Xác Nhận',
    Pending: 'Chờ Xử Lý',
    Rescheduled: 'Đổi Lịch',
    Completed: 'Hoàn Thành',
    Cancelled: 'Đã Hủy',
  }
  const typeLabels: Record<string, string> = {
    test_drive: 'Lái Thử',
    consultation: 'Tham Quan',
    showroom: 'Tham Quan',
    appraisal: 'Định Giá',
    delivery: 'Bàn Giao',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết lịch hẹn"
      footer={
        <>
          {onConfirm && canManagerConfirm(appointment.status) && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void onConfirm(numericId)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isBusy ? 'Đang xử lý...' : 'Chấp nhận / Xác nhận lịch'}
            </button>
          )}
          {onCancelBooking && canManagerCancel(appointment.status) && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (!window.confirm('Hủy lịch hẹn này cho khách?')) return
                void onCancelBooking(numericId)
              }}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Hủy lịch
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white"
          >
            Đóng
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={statusVariant}>{statusLabels[appointment.status] ?? appointment.status}</Badge>
          <Badge
            variant={
              appointment.type === 'test_drive' ? 'confirmed' : 'pending'
            }
          >
            {typeLabels[appointment.type] ?? appointment.type}
          </Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Khách hàng</p>
          <p className="font-bold text-slate-900">{appointment.customerName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Xe</p>
          <p className="font-medium text-slate-900">{appointment.vehicleName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Nhân viên phụ trách</p>
          <p className="font-medium">{appointment.staffName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Thời gian</p>
          <p className="font-medium">
            {appointment.date} - {appointment.timeSlot}
          </p>
        </div>
      </div>
    </Modal>
  )
}
