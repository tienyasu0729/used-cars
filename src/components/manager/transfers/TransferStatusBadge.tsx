import type { TransferStatus } from '@/types/transfer.types'

const LABELS: Record<TransferStatus, string> = {
  Pending: 'Chờ phê duyệt',
  Approved: 'Đã phê duyệt',
  Rejected: 'Từ chối',
  Completed: 'Hoàn thành',
}

const STYLES: Record<TransferStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Approved: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
  Completed: 'bg-sky-100 text-sky-900',
}

export function TransferStatusBadge({ status }: { status: TransferStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
