import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'
import type { AdminTransfer } from '@/mock/mockAdminData'

interface TransferApprovalModalProps {
  transfer: AdminTransfer | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string, note?: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
  initialMode?: 'confirm' | 'reject'
}

export function TransferApprovalModal({
  transfer,
  isOpen,
  onClose,
  onApprove,
  onReject,
  initialMode = 'confirm',
}: TransferApprovalModalProps) {
  const [mode, setMode] = useState<'confirm' | 'reject'>(initialMode)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) setMode(initialMode)
  }, [isOpen, initialMode])

  const handleApprove = async () => {
    if (!transfer) return
    setLoading(true)
    try {
      await onApprove(transfer.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!transfer || !reason.trim()) return
    setLoading(true)
    try {
      await onReject(transfer.id, reason)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!transfer) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setMode('confirm'); setReason(''); onClose() }}
      title={mode === 'confirm' ? 'Xác nhận duyệt điều chuyển' : 'Từ chối điều chuyển'}
      footer={
        mode === 'confirm' ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button variant="primary" onClick={handleApprove} loading={loading}>
              Xác nhận duyệt
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMode('confirm')}>Quay lại</Button>
            <Button variant="danger" onClick={handleReject} loading={loading} disabled={!reason.trim()}>
              Từ chối
            </Button>
          </div>
        )
      }
    >
      {mode === 'confirm' ? (
        <p className="text-slate-600">
          Duyệt điều chuyển xe <strong>{transfer.vehicleName}</strong> từ <strong>{transfer.fromBranch}</strong> sang <strong>{transfer.toBranch}</strong>?
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-600">Nhập lý do từ chối (bắt buộc):</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
          />
        </div>
      )}
      {mode === 'confirm' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setMode('reject')}
            className="text-sm text-red-500 hover:underline"
          >
            Từ chối điều chuyển
          </button>
        </div>
      )}
    </Modal>
  )
}
