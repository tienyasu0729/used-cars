import { useEffect, useState } from 'react'
import { Modal, Badge, ConfirmDialog } from '@/components/ui'
import type { ManagerAppointment } from '@/types/managerAppointment.types'
import { formatBookingDateTimeVi } from '@/utils/bookingDisplay'

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
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) setCancelConfirmOpen(false)
  }, [isOpen])

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
    AwaitingContract: 'Chờ Ký HĐ',
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
    <>
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
              onClick={() => setCancelConfirmOpen(true)}
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
          {appointment.phone ? (
            <p className="mt-1 text-sm text-slate-700">
              SĐT:{' '}
              <a href={`tel:${appointment.phone.replace(/\s/g, '')}`} className="font-medium text-[#1A3C6E] hover:underline">
                {appointment.phone}
              </a>
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-slate-400">Chưa có số điện thoại</p>
          )}
        </div>
        {appointment.branchName && (
          <div>
            <p className="text-xs font-medium text-slate-500">Chi nhánh</p>
            <p className="font-medium text-slate-900">{appointment.branchName}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500">Xe</p>
          <p className="font-medium text-slate-900">{appointment.vehicleName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Nhân viên phụ trách</p>
          <p className="font-medium">{appointment.staffName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Thời gian hẹn</p>
          <p className="font-medium leading-snug text-slate-900">
            {formatBookingDateTimeVi(appointment.date, appointment.timeSlot)}
          </p>
        </div>
        {appointment.createdAt && (
          <div>
            <p className="text-xs font-medium text-slate-500">Thời điểm đặt lịch</p>
            <p className="font-medium text-slate-700">
              {new Date(appointment.createdAt).toLocaleString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
        {appointment.notes ? (
          <div>
            <p className="text-xs font-medium text-slate-500">Ghi chú khách</p>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{appointment.notes}</p>
          </div>
        ) : null}
      </div>
    </Modal>
    <ConfirmDialog
      isOpen={cancelConfirmOpen}
      onClose={() => setCancelConfirmOpen(false)}
      title="Hủy lịch hẹn"
      message="Hủy lịch hẹn này cho khách? Thao tác sẽ cập nhật trạng thái theo quy trình."
      confirmLabel="Hủy lịch"
      loading={isBusy}
      onConfirm={async () => {
        if (onCancelBooking) await onCancelBooking(numericId)
        setCancelConfirmOpen(false)
      }}
    />
    </>
  )
}
