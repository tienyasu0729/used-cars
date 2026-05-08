import { useEffect, useState } from 'react'
import { Modal, Badge, ConfirmDialog } from '@/components/ui'
import { contractService } from '@/services/contract.service'
import type { ContractPreview } from '@/types/contract.types'
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

function splitContractUrls(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function isImageUrl(value: string): boolean {
  return value.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(value)
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const [contractPreview, setContractPreview] = useState<ContractPreview | null>(null)
  const [contractLoading, setContractLoading] = useState(false)
  const [contractError, setContractError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) setCancelConfirmOpen(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !appointment) {
      setContractPreview(null)
      setContractError(null)
      setContractLoading(false)
      return
    }

    let cancelled = false
    const bookingId = Number(appointment.id)
    setContractLoading(true)
    setContractError(null)
    setContractPreview(null)

    contractService
      .getStaffContractPreview(bookingId)
      .then((preview) => {
        if (!cancelled) setContractPreview(preview)
      })
      .catch(() => {
        if (!cancelled) setContractError('Không tải được thông tin hợp đồng.')
      })
      .finally(() => {
        if (!cancelled) setContractLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, appointment])

  if (!appointment) return null

  const numericId = Number(appointment.id)
  const isBusy = actionBookingId === numericId
  const isContractSigned = contractPreview?.contractStatus === 'SIGNED'
  const signatureUrls = splitContractUrls(contractPreview?.signatureUrl)
  const idCardUrls = splitContractUrls(contractPreview?.idCardUrl)
  const licenseUrls = splitContractUrls(contractPreview?.licenseUrl)

  async function handleOpenContractPdf() {
    if (!isContractSigned) return
    setPdfLoading(true)
    try {
      const blob = await contractService.downloadStaffContractPdf(numericId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } finally {
      setPdfLoading(false)
    }
  }

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
    NoShow: 'Khách không đến',
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hợp đồng lái thử</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {contractLoading
                  ? 'Đang tải hợp đồng...'
                  : isContractSigned
                    ? 'Khách hàng đã ký hợp đồng'
                    : 'Chưa có hợp đồng đã ký'}
              </p>
            </div>
            {isContractSigned ? (
              <button
                type="button"
                disabled={pdfLoading}
                onClick={() => void handleOpenContractPdf()}
                className="rounded-lg border border-[#1A3C6E]/20 bg-white px-3 py-2 text-xs font-semibold text-[#1A3C6E] hover:bg-[#1A3C6E]/5 disabled:opacity-50"
              >
                {pdfLoading ? 'Đang mở...' : 'Xem PDF'}
              </button>
            ) : null}
          </div>

          {contractError ? (
            <p className="text-sm text-red-600">{contractError}</p>
          ) : contractPreview ? (
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Trạng thái</p>
                  <p className="font-medium text-slate-800">
                    {isContractSigned ? 'Đã ký' : contractPreview.contractStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Thời điểm ký</p>
                  <p className="font-medium text-slate-800">{formatDateTime(contractPreview.signedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Phiên bản điều khoản</p>
                  <p className="font-medium text-slate-800">{contractPreview.termsVersion}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Mã xác thực nội dung</p>
                  <p className="break-all font-mono text-xs text-slate-700">
                    {contractPreview.contentSha256 ?? 'Chưa có'}
                  </p>
                </div>
              </div>

              {signatureUrls.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Chữ ký khách hàng</p>
                  {signatureUrls[0] && isImageUrl(signatureUrls[0]) ? (
                    <img
                      src={signatureUrls[0]}
                      alt="Chữ ký khách hàng"
                      className="max-h-28 rounded-lg border border-slate-200 bg-white object-contain p-2"
                    />
                  ) : (
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800">
                      {signatureUrls[0]}
                    </p>
                  )}
                </div>
              ) : null}

              {(idCardUrls.length > 0 || licenseUrls.length > 0) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {idCardUrls.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">CCCD/CMND</p>
                      <div className="flex flex-wrap gap-2">
                        {idCardUrls.map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1A3C6E] ring-1 ring-[#1A3C6E]/15 hover:bg-[#1A3C6E]/5"
                          >
                            Mở ảnh {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {licenseUrls.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">Giấy phép lái xe</p>
                      <div className="flex flex-wrap gap-2">
                        {licenseUrls.map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1A3C6E] ring-1 ring-[#1A3C6E]/15 hover:bg-[#1A3C6E]/5"
                          >
                            Mở ảnh {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa có dữ liệu hợp đồng.</p>
          )}
        </div>
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
