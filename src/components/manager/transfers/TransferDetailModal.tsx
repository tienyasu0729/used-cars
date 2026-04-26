import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Modal, Button } from '@/components/ui'
import { transferService } from '@/services/transfer.service'
import { TransferStatusBadge } from './TransferStatusBadge'
import { TransferApprovalPanel } from './TransferApprovalPanel'
import { useTransferActions } from '@/hooks/useTransferActions'
import type { UserRole } from '@/types/auth.types'

function formatTs(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN')
  } catch {
    return iso
  }
}

export function TransferDetailModal({
  transferId,
  isOpen,
  onClose,
  role,
  myBranchId,
}: {
  transferId: number | null
  isOpen: boolean
  onClose: () => void
  role: UserRole
  myBranchId?: number
}) {
  const { complete, approve, reject } = useTransferActions()

  const { data: t, isLoading } = useQuery({
    queryKey: ['transfer-detail', transferId],
    queryFn: () => transferService.getTransferById(transferId!),
    enabled: isOpen && transferId != null,
  })

  const [completeNote, setCompleteNote] = useState('')
  const [completing, setCompleting] = useState(false)

  // Manager chi nhánh NGUỒN (nơi có xe) → Phê duyệt / Từ chối khi Pending
  const showApprovalActions =
    (role === 'BranchManager' || role === 'SalesStaff') &&
    t?.status === 'Pending' &&
    myBranchId != null &&
    t.fromBranchId === myBranchId

  // Manager chi nhánh ĐÍCH (người yêu cầu) → Xác nhận nhận xe khi đã Approved
  const showComplete =
    role === 'BranchManager' && t?.status === 'Approved' && myBranchId != null && t.toBranchId === myBranchId

  if (!isOpen) return null

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Chi tiết điều chuyển"
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {transferId == null ? (
        <p className="text-sm text-slate-500">Chưa chọn yêu cầu.</p>
      ) : isLoading || !t ? (
        <p className="text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-slate-500">Mã yêu cầu</span>
              <p className="font-mono font-medium">#{t.id}</p>
            </div>
            <div>
              <span className="text-slate-500">Xe</span>
              <p className="font-bold">{t.vehicleTitle}</p>
              <p className="text-xs text-slate-500">{t.vehicleListingId}</p>
            </div>
            <div>
              <span className="text-slate-500">Tuyến</span>
              <p>
                {t.fromBranchName} → {t.toBranchName}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Người tạo</span>
              <p>{t.requestedByName}</p>
            </div>
            <div>
              <span className="text-slate-500">Lý do</span>
              <p>{t.reason ?? '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Trạng thái</span>
              <TransferStatusBadge status={t.status} />
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-800">Dòng thời gian</h4>
            <ul className="space-y-2 border-l-2 border-slate-200 pl-4 text-sm">
              <li>
                <span className="font-medium">Tạo yêu cầu</span>
                <span className="ml-2 text-slate-500">{formatTs(t.createdAt)}</span>
              </li>
              {(t.approvalHistory ?? []).map((h, i) => (
                <li key={i}>
                  <span className="font-medium">
                    {h.action === 'Approved' ? 'Phê duyệt' : 'Từ chối'} — {h.approvedByName}
                  </span>
                  <span className="ml-2 text-slate-500">{formatTs(h.actedAt)}</span>
                  {h.note && <p className="text-slate-600">{h.note}</p>}
                </li>
              ))}
              {t.status === 'Completed' && (
                <li>
                  <span className="font-medium">Đã nhận xe</span>
                  <span className="ml-2 text-slate-500">{formatTs(t.updatedAt)}</span>
                </li>
              )}
            </ul>
          </div>

          {showApprovalActions && (
            <TransferApprovalPanel
              onApprove={(note) => approve({ id: t.id, note }).then(() => onClose())}
              onReject={(note) => reject({ id: t.id, note }).then(() => onClose())}
            />
          )}

          {t.status === 'Approved' &&
            myBranchId != null &&
            t.toBranchId === myBranchId &&
            role === 'SalesStaff' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Yêu cầu đang chờ nhận xe tại chi nhánh bạn. Chỉ <strong>Trưởng chi nhánh</strong> mới bấm được{' '}
                <strong>Xác nhận nhận xe</strong> — vui lòng nhờ quản lý thao tác (hoặc dùng tài khoản Trưởng chi nhánh).
              </div>
            )}

          {showComplete && (
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-sm font-medium text-emerald-900">Xác nhận đã nhận xe tại chi nhánh</p>
              <textarea
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                rows={2}
                maxLength={500}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="primary"
                disabled={completing}
                loading={completing}
                onClick={async () => {
                  setCompleting(true)
                  try {
                    await complete({
                      id: t.id,
                      note: completeNote.trim() || undefined,
                    })
                    onClose()
                  } finally {
                    setCompleting(false)
                  }
                }}
              >
                Xác nhận nhận xe
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
