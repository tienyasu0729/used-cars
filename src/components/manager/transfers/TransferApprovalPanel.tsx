import { useState } from 'react'
import { Button } from '@/components/ui'
import { useHasPermission } from '@/hooks/usePermissions'

/** Form ghi chú Approve/Reject — note bắt buộc tối thiểu 5 ký tự (theo backend). */
export function TransferApprovalPanel({
  onApprove,
  onReject,
  disabled,
}: {
  onApprove: (note: string) => Promise<void>
  onReject: (note: string) => Promise<void>
  disabled?: boolean
}) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const canApprove = useHasPermission('Transfers', 'approve')

  const valid = note.trim().length >= 5

  if (!canApprove) return null

  const run = async (kind: 'approve' | 'reject') => {
    if (!valid) return
    setLoading(kind)
    try {
      if (kind === 'approve') await onApprove(note.trim())
      else await onReject(note.trim())
      setNote('')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">Ghi chú phê duyệt / từ chối (tối thiểu 5 ký tự)</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={500}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Ví dụ: Đồng ý điều chuyển theo nhu cầu kho…"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={disabled || !valid || loading !== null}
          loading={loading === 'approve'}
          onClick={() => run('approve')}
        >
          Phê duyệt
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={disabled || !valid || loading !== null}
          loading={loading === 'reject'}
          onClick={() => run('reject')}
        >
          Từ chối
        </Button>
      </div>
    </div>
  )
}
