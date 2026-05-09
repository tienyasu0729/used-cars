import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

type ConfirmVariant = 'danger' | 'primary'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ConfirmVariant
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  confirmVariant = 'danger',
  loading: loadingProp,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) setInternalLoading(false)
  }, [isOpen])

  const loading = loadingProp ?? internalLoading
  const safeClose = () => {
    if (!loading) onClose()
  }

  const handleConfirm = () => {
    const run = async () => {
      if (loading) return
      if (loadingProp === undefined) setInternalLoading(true)
      try {
        await Promise.resolve(onConfirm())
      } finally {
        if (loadingProp === undefined) setInternalLoading(false)
      }
    }
    void run()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={safeClose}
      title={title}
      layerClassName="z-[100]"
      footer={
        <>
          <Button type="button" variant="outline" disabled={loading} onClick={safeClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            loading={loading}
            disabled={loading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-slate-600">{message}</div>
    </Modal>
  )
}
