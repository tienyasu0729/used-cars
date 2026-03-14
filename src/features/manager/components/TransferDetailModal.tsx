import { Modal } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { ManagerTransfer } from '@/mock/mockManagerData'

interface TransferDetailModalProps {
  transfer: ManagerTransfer | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function TransferDetailModal({
  transfer,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: TransferDetailModalProps) {
  if (!transfer) return null

  const statusVariant =
    transfer.status === 'approved'
      ? 'confirmed'
      : transfer.status === 'rejected'
        ? 'danger'
        : 'pending'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết điều chuyển"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Đóng
          </button>
          {transfer.status === 'pending' && (
            <>
              {onApprove && (
                <button
                  onClick={() => {
                    onApprove(transfer.id)
                    onClose()
                  }}
                  className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white"
                >
                  Duyệt
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => {
                    onReject(transfer.id)
                    onClose()
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
                >
                  Từ chối
                </button>
              )}
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Mã yêu cầu</p>
          <p className="font-mono text-sm">#{transfer.id.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Xe</p>
          <p className="font-bold text-slate-900">{transfer.vehicleName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Từ chi nhánh</p>
          <p className="font-medium">{transfer.fromBranchName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Đến chi nhánh</p>
          <p className="font-medium">{transfer.toBranchName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Ngày yêu cầu</p>
          <p className="font-medium">{transfer.createdAt}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Trạng thái</p>
          <Badge variant={statusVariant}>
            {transfer.status === 'pending'
              ? 'Chờ Duyệt'
              : transfer.status === 'approved'
                ? 'Đã Duyệt'
                : 'Từ Chối'}
          </Badge>
        </div>
      </div>
    </Modal>
  )
}
