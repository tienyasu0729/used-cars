import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import type { Booking } from '@/types/booking.types'
import type { Vehicle } from '@/types/vehicle.types'
import type { Branch } from '@/types'
import { formatDate, formatDateTime } from '@/utils/format'
import { Calendar, Clock, MapPin, FileText, Trash2, AlertTriangle, X } from 'lucide-react'

const statusMap: Record<string, { variant: 'pending' | 'confirmed' | 'sold' | 'default'; label: string }> = {
  Pending: { variant: 'pending', label: 'Chờ Xác Nhận' },
  Confirmed: { variant: 'confirmed', label: 'Đã Xác Nhận' },
  Rescheduled: { variant: 'pending', label: 'Đổi Lịch' },
  Completed: { variant: 'confirmed', label: 'Hoàn Thành' },
  Cancelled: { variant: 'default', label: 'Đã Hủy' },
}

function canCustomerCancel(status: Booking['status']): boolean {
  return status === 'Pending' || status === 'Confirmed' || status === 'Rescheduled'
}

interface BookingDetailModalProps {
  booking: Booking | null
  vehicle?: Vehicle | null
  branch?: Branch | null
  isOpen: boolean
  onClose: () => void
  onCancelBooking?: (id: number) => void | Promise<void>
  isCancelling?: boolean
}

export function BookingDetailModal({
  booking,
  vehicle,
  branch,
  isOpen,
  onClose,
  onCancelBooking,
  isCancelling,
}: BookingDetailModalProps) {
  const navigate = useNavigate()
  const [confirmStep, setConfirmStep] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  // Reset confirm step when modal closes or booking changes
  useEffect(() => {
    setConfirmStep(false)
    clearResetTimer()
  }, [isOpen, booking?.id, clearResetTimer])

  // Auto-reset confirm step after 4 seconds
  useEffect(() => {
    if (confirmStep) {
      resetTimerRef.current = setTimeout(() => {
        setConfirmStep(false)
      }, 4000)
      return () => clearResetTimer()
    }
  }, [confirmStep, clearResetTimer])

  if (!booking) return null

  const status = statusMap[booking.status] ?? { variant: 'default' as const, label: booking.status }
  const img0 = vehicle?.images?.[0]
  const imageUrl = (typeof img0 === 'string' ? img0 : img0?.url) ?? null
  const title = vehicle != null
    ? `${vehicle.brand} ${vehicle.model}`
    : booking.vehicleTitle || 'Xe'
  const branchName = branch?.name ?? booking.branchName
  const showCancel = onCancelBooking && canCustomerCancel(booking.status)
  const history = booking.statusHistory ?? []
  const showReviewNow = booking.status === 'Completed'

  const handleCancelClick = () => {
    if (!confirmStep) {
      setConfirmStep(true)
      return
    }
    clearResetTimer()
    void onCancelBooking?.(booking.id)
  }

  const handleResetConfirm = () => {
    setConfirmStep(false)
    clearResetTimer()
  }

  const handleReviewNow = () => {
    onClose()
    navigate(`/vehicles/${booking.vehicleId}#reviews`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết lịch lái thử">
      <div className="space-y-5">
        {/* Hero Image */}
        {imageUrl && (
          <div className="relative -mx-6 -mt-2 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="h-48 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <h3 className="text-lg font-bold text-white drop-shadow-md">{title}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>
        )}

        {/* Fallback header when no image */}
        {!imageUrl && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={Calendar} label="Ngày hẹn" value={formatDate(booking.bookingDate)} />
          <InfoItem icon={Clock} label="Giờ hẹn" value={booking.timeSlot} />
          <InfoItem icon={MapPin} label="Chi nhánh" value={branchName} />
          {booking.note && (
            <InfoItem icon={FileText} label="Ghi chú" value={booking.note} />
          )}
        </div>

        {/* Compact Timeline */}
        {history.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lịch sử trạng thái
            </p>
            <div className="relative space-y-0 border-l-2 border-slate-200 pl-4">
              {history.map((h, i) => (
                <div key={i} className="relative pb-3 last:pb-0">
                  <span
                    className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#1A3C6E]"
                    style={i === history.length - 1 ? { backgroundColor: statusDotColor(h.newStatus) } : {}}
                  />
                  <p className="text-sm font-medium text-slate-700">
                    {statusMap[h.newStatus]?.label ?? h.newStatus}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(h.changedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReviewNow && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="mb-2 text-sm font-semibold text-emerald-800">
              Bạn đã hoàn thành buổi lái thử
            </p>
            <p className="mb-3 text-xs text-emerald-700/90">
              Hãy chia sẻ trải nghiệm để giúp người mua khác có thêm thông tin tham khảo.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReviewNow}
            >
              Đánh giá ngay
            </Button>
          </div>
        )}

        {/* Danger Zone */}
        {showCancel && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-semibold text-red-800">Hủy lịch lái thử</p>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-red-600/80">
              Bạn sẽ mất lượt đăng ký này và cần đặt lịch lại từ đầu nếu muốn thay đổi.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                loading={isCancelling}
                onClick={handleCancelClick}
                className={`transition-all duration-200 ${
                  confirmStep
                    ? 'animate-pulse bg-red-700 hover:bg-red-800'
                    : ''
                }`}
              >
                {isCancelling ? (
                  'Đang hủy...'
                ) : confirmStep ? (
                  'Xác nhận hủy?'
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hủy lịch hẹn này
                  </>
                )}
              </Button>
              {confirmStep && !isCancelling && (
                <button
                  type="button"
                  onClick={handleResetConfirm}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Không
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'Confirmed':
    case 'Completed':
      return '#2563eb'
    case 'Cancelled':
      return '#9ca3af'
    case 'Pending':
    case 'Rescheduled':
      return '#eab308'
    default:
      return '#1A3C6E'
  }
}
