import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'
import type { TransferRequest } from '@/types/transfer.types'

interface TransferApprovalModalProps {
  transfer: TransferRequest | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: number, note: string) => Promise<void>
  onReject: (id: number, note: string) => Promise<void>
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
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setNote('')
    }
  }, [isOpen, initialMode])

  const valid = note.trim().length >= 5

  const handleApprove = async () => {
    if (!transfer || !valid) return
    setLoading(true)
    try {
      await onApprove(transfer.id, note.trim())
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!transfer || !valid) return
    setLoading(true)
    try {
      await onReject(transfer.id, note.trim())
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!transfer) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setMode('confirm')
        setNote('')
        onClose()
      }}
      title={mode === 'confirm' ? 'Xác nhận duyệt điều chuyển' : 'Từ chối điều chuyển'}
      footer={
        mode === 'confirm' ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleApprove} loading={loading} disabled={!valid}>
              Xác nhận duyệt
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMode('confirm')}>
              Quay lại
            </Button>
            <Button variant="danger" onClick={handleReject} loading={loading} disabled={!valid}>
              Từ chối
            </Button>
          </div>
        )
      }
    >
      {mode === 'confirm' ? (
        <div className="space-y-4">
          <p className="text-slate-600">
            Duyệt điều chuyển xe <strong>{transfer.vehicleTitle}</strong> từ{' '}
            <strong>{transfer.fromBranchName}</strong> sang <strong>{transfer.toBranchName}</strong>?
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú (bắt buộc, tối thiểu 5 ký tự)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Approve từ admin panel"
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-600">Nhập lý do từ chối (tối thiểu 5 ký tự):</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Lý do từ chối…"
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      )}
      {mode === 'confirm' && (
        <div className="mt-4">
          <button type="button" onClick={() => setMode('reject')} className="text-sm text-red-500 hover:underline">
            Chuyển sang từ chối
          </button>
        </div>
      )}
    </Modal>
  )
}
