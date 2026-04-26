import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

interface ResetPasswordResultModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  temporaryPassword: string
}

export function ResetPasswordResultModal({
  isOpen,
  onClose,
  userName,
  temporaryPassword,
}: ResetPasswordResultModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
    }
  }, [isOpen])

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đặt lại mật khẩu"
      footer={
        <Button variant="primary" onClick={onClose}>Đóng</Button>
      }
    >
      <p className="text-sm text-slate-600">
        Mật khẩu tạm cho <span className="font-semibold text-slate-900">{userName}</span>:
      </p>
      <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-medium text-slate-900 select-all">
        {temporaryPassword}
      </p>
      <button
        type="button"
        onClick={copyPassword}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label={copied ? 'Đã sao chép mật khẩu' : 'Sao chép mật khẩu tạm'}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span className="text-emerald-700">Đã sao chép</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 shrink-0" aria-hidden />
            <span>Sao chép</span>
          </>
        )}
      </button>
      <p className="mt-2 text-xs text-amber-800">
        Gửi mật khẩu tạm cho người dùng. Khi họ đăng nhập, hệ thống sẽ yêu cầu đặt mật khẩu mới ngay — không thể bỏ
        qua bước này.
      </p>
    </Modal>
  )
}
