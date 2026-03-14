import { Modal } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { ManagerAppointment } from '@/mock/mockManagerData'

interface AppointmentDetailModalProps {
  appointment: ManagerAppointment | null
  isOpen: boolean
  onClose: () => void
}

export function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailModalProps) {
  if (!appointment) return null

  const statusVariant =
    appointment.status === 'Confirmed'
      ? 'confirmed'
      : appointment.status === 'Pending'
        ? 'pending'
        : 'default'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết lịch hẹn"
      footer={
        <button
          onClick={onClose}
          className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white"
        >
          Đóng
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={statusVariant}>{appointment.status}</Badge>
          <Badge
            variant={
              appointment.type === 'test_drive' ? 'confirmed' : 'pending'
            }
          >
            {appointment.type === 'test_drive' ? 'Lái thử' : 'Tư vấn'}
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
