import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { Notification } from '@/types'
import { formatDate } from '@/utils/format'
import { Pagination } from '@/components/ui'
import { normalizeCustomerNotificationLink } from '@/utils/notificationNavigation'
import {
  consultationRefIdFromLink,
  consultationStatusLabelVi,
  parseLegacyConsultationNotificationBody,
} from '@/utils/consultationNotificationDetail'
import { fetchMyConsultation } from '@/services/consultation.service'
import { Bell, Calendar, Shield, ShoppingBag, Tag, Car, ArrowRightLeft, MessageCircle, Loader2 } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

const typeIcons: Record<string, typeof Bell> = {
  Booking: Calendar,
  Deposit: Shield,
  Order: ShoppingBag,
  PriceDrop: Tag,
  System: Bell,
  Consultation: MessageCircle,
  AppointmentTestDrive: Car,
  AppointmentConsultation: Calendar,
  TransferIncoming: ArrowRightLeft,
  TransferOutgoing: ArrowRightLeft,
}

function ConsultationDetailFields(props: {
  ticketId: string
  vehicleLine: string
  vehicleId: number | null
  message: string
  status?: string
  assignedStaffName?: string | null
}) {
  const { ticketId, vehicleLine, vehicleId, message, status, assignedStaffName } = props
  return (
    <dl className="space-y-4 text-sm">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mã phiếu</dt>
        <dd className="mt-0.5 font-medium text-slate-900">#{ticketId}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Xe đính kèm</dt>
        <dd className="mt-0.5 text-slate-800">
          {vehicleId != null ? (
            <Link
              to={`/vehicles/${vehicleId}`}
              className="font-medium text-[#1A3C6E] underline-offset-2 hover:underline"
            >
              {vehicleLine}
            </Link>
          ) : (
            vehicleLine
          )}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nội dung yêu cầu tư vấn</dt>
        <dd className="mt-0.5 whitespace-pre-wrap rounded-lg bg-white p-3 text-slate-800 ring-1 ring-slate-200/80">
          {message || '—'}
        </dd>
      </div>
      {status != null && status !== '' && (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</dt>
          <dd className="mt-0.5">{consultationStatusLabelVi(status)}</dd>
        </div>
      )}
      {assignedStaffName != null && assignedStaffName !== '' && (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhân viên phụ trách</dt>
          <dd className="mt-0.5 text-slate-800">{assignedStaffName}</dd>
        </div>
      )}
    </dl>
  )
}

interface NotificationListProps {
  notifications: Notification[]
  onMarkRead?: (id: string) => void
  /** Khách: link /deposits → /dashboard/deposits; không có route → popup chi tiết */
  linkBehavior?: 'customer' | 'default'
}

export function NotificationList({ notifications, onMarkRead, linkBehavior = 'default' }: NotificationListProps) {
  const [detail, setDetail] = useState<Notification | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => { setPage(1) }, [notifications.length])

  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize))
  const paginated = notifications.slice((page - 1) * pageSize, page * pageSize)

  const consultationRefId =
    detail?.type === 'Consultation' ? consultationRefIdFromLink(detail.link) : null

  const consultationQuery = useQuery({
    queryKey: ['consultation-mine', consultationRefId],
    queryFn: () => fetchMyConsultation(consultationRefId!),
    enabled: consultationRefId != null,
  })

  const markIfNeeded = (n: Notification) => {
    if (!n.read) onMarkRead?.(n.id)
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Không có thông báo
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {paginated.map((n) => {
          const Icon = typeIcons[n.type] ?? Bell
          const customerTarget =
            linkBehavior === 'customer' ? normalizeCustomerNotificationLink(n.link) : (n.link ?? null)
          const openModal = linkBehavior === 'customer' && customerTarget === null

          const rowClass = `flex w-full gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-slate-50 ${
            n.read ? 'border-slate-200 bg-white' : 'border-[#1A3C6E]/20 bg-blue-50/50'
          }`

          if (openModal) {
            return (
              <button
                key={n.id}
                type="button"
                className={rowClass}
                onClick={() => {
                  markIfNeeded(n)
                  setDetail(n)
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3C6E]/10 text-[#1A3C6E]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{n.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && <div className="h-2 w-2 shrink-0 rounded-full bg-[#E8612A]" />}
              </button>
            )
          }

          const to = linkBehavior === 'customer' ? (customerTarget ?? '#') : (n.link ?? '#')
          return (
            <Link
              key={n.id}
              to={to}
              onClick={(e) => {
                markIfNeeded(n)
                if (to === '#') e.preventDefault()
              }}
              className={rowClass}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3C6E]/10 text-[#1A3C6E]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                  {n.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{n.body}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && <div className="h-2 w-2 shrink-0 rounded-full bg-[#E8612A]" />}
            </Link>
          )
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} total={notifications.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="thông báo" />

      <Modal
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.title}
        footer={
          <Button type="button" variant="primary" onClick={() => setDetail(null)}>
            Đóng
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4 text-sm text-slate-700">
            {detail.type === 'Consultation' ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1A3C6E]">
                  Chi tiết phiếu tư vấn
                </p>
                <p className="text-slate-600">Đội ngũ showroom đang xử lý yêu cầu của bạn.</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4">
                  {consultationRefId != null && consultationQuery.isPending && (
                    <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang tải chi tiết phiếu…</span>
                    </div>
                  )}
                  {consultationRefId != null && consultationQuery.isSuccess && consultationQuery.data && (
                    <ConsultationDetailFields
                      ticketId={String(consultationQuery.data.id)}
                      vehicleLine={
                        consultationQuery.data.vehicleTitle?.trim()
                          ? consultationQuery.data.vehicleTitle
                          : 'Không chọn xe cụ thể'
                      }
                      vehicleId={consultationQuery.data.vehicleId}
                      message={consultationQuery.data.message}
                      status={consultationQuery.data.status}
                      assignedStaffName={consultationQuery.data.assignedStaffName}
                    />
                  )}
                  {consultationRefId != null && consultationQuery.isError && (
                    <div className="space-y-3">
                      <p className="text-xs text-amber-700">
                        Không tải được dữ liệu mới nhất từ máy chủ. Hiển thị theo nội dung thông báo (nếu có).
                      </p>
                      {(() => {
                        const parsed = parseLegacyConsultationNotificationBody(detail.body)
                        if (parsed?.vehicleLine || parsed?.message) {
                          return (
                            <ConsultationDetailFields
                              ticketId={parsed.ticketId ?? '—'}
                              vehicleLine={parsed.vehicleLine ?? 'Không chọn xe cụ thể'}
                              vehicleId={null}
                              message={parsed.message ?? '—'}
                            />
                          )
                        }
                        return <p className="whitespace-pre-wrap leading-relaxed">{detail.body}</p>
                      })()}
                    </div>
                  )}
                  {consultationRefId == null && (
                    <>
                      {(() => {
                        const parsed = parseLegacyConsultationNotificationBody(detail.body)
                        if (parsed?.vehicleLine || parsed?.message) {
                          return (
                            <ConsultationDetailFields
                              ticketId={parsed.ticketId ?? '—'}
                              vehicleLine={parsed.vehicleLine ?? 'Không chọn xe cụ thể'}
                              vehicleId={null}
                              message={parsed.message ?? '—'}
                            />
                          )
                        }
                        return <p className="whitespace-pre-wrap leading-relaxed">{detail.body}</p>
                      })()}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div>
                <p className="whitespace-pre-wrap leading-relaxed">{detail.body}</p>
              </div>
            )}
            <p className="text-xs text-slate-400">Gửi lúc {formatDate(detail.createdAt)}</p>
          </div>
        )}
      </Modal>
    </>
  )
}
