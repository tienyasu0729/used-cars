import type { Booking } from '@/types'
import type { Vehicle } from '@/types'
import { Modal } from '@/components/ui'
import { Badge } from '@/components/ui'
import { formatPrice } from '@/utils/format'

interface BookingDetailModalProps {
  booking: Booking | null
  vehicle: Vehicle | null
  branchName?: string
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  onCancel?: () => void
}

export function BookingDetailModal({
  booking,
  vehicle,
  branchName,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: BookingDetailModalProps) {
  if (!booking) return null

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') return <Badge variant="pending">Chờ xác nhận</Badge>
    if (status === 'Confirmed') return <Badge variant="confirmed">Đã xác nhận</Badge>
    if (status === 'Completed') return <Badge variant="available">Hoàn thành</Badge>
    return <Badge variant="default">Đã hủy</Badge>
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết lịch hẹn">
      <div className="space-y-4">
        <div className="flex gap-4">
          {vehicle?.images?.[0] && (
            <img
              src={vehicle.images[0]}
              alt=""
              className="h-24 w-32 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-bold text-slate-900">{vehicle?.brand} {vehicle?.model}</p>
            <p className="text-[#E8612A] font-bold">{vehicle && formatPrice(vehicle.price)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Khách hàng</p>
          <p className="font-medium text-slate-900">#{booking.customerId}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Chi nhánh</p>
          <p className="font-medium text-slate-900">{branchName ?? booking.branchId}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Thời gian</p>
          <p className="font-medium text-slate-900">{booking.date} {booking.timeSlot}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Trạng thái</p>
          {getStatusBadge(booking.status)}
        </div>
        {booking.note && (
          <div>
            <p className="text-xs font-medium text-slate-500">Ghi chú</p>
            <p className="text-sm text-slate-700">{booking.note}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Đóng
        </button>
        {booking.status === 'Pending' && (
          <>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
              >
                Xác nhận
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Hủy lịch
              </button>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
