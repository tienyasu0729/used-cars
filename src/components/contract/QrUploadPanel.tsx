import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { contractService } from '@/services/contract.service'
import { Button, Spinner } from '@/components/ui'
import type { DocumentSessionResponse } from '@/types/contract.types'

interface QrUploadPanelProps {
  bookingId: number
  purpose: string
  label: string
  onUploaded: (fileUrl: string) => void
}

export function QrUploadPanel({ bookingId, purpose, label, onUploaded }: QrUploadPanelProps) {
  const [session, setSession] = useState<DocumentSessionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const startSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await contractService.createDocumentSession(bookingId, purpose)
      setSession(res)
      pollRef.current = setInterval(async () => {
        try {
          const poll = await contractService.pollDocumentSession(res.sessionId)
          if (poll.status === 'COMPLETED' && poll.fileUrl) {
            stopPolling()
            setSession(poll)
            onUploaded(poll.fileUrl)
          } else if (poll.status === 'EXPIRED') {
            stopPolling()
            setSession(poll)
            setError('Session đã hết hạn. Vui lòng tạo mới.')
          }
        } catch {
          stopPolling()
          setError('Lỗi kiểm tra trạng thái session.')
        }
      }, 2500)
    } catch {
      setError('Không thể tạo session. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (session?.status === 'COMPLETED' && session.fileUrl) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="mb-2 text-sm font-medium text-green-800">{label}: Đã tải lên</p>
        <img src={session.fileUrl} alt={label} className="h-24 rounded object-contain" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">{label}</p>
      {!session ? (
        <Button variant="outline" size="sm" loading={loading} onClick={startSession}>
          Chụp bằng điện thoại
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <QRCodeSVG value={session.qrUrl!} size={180} />
          <p className="text-xs text-gray-500">Quét mã QR bằng điện thoại để chụp ảnh</p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Spinner size="sm" />
            <span>Đang chờ tải lên...</span>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
