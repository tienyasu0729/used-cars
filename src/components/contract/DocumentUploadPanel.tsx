import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Camera, QrCode, X, CheckCircle, ImageIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { contractService } from '@/services/contract.service'
import { Button, Spinner } from '@/components/ui'
import { DOCUMENT_UPLOAD_MAX_BYTES, DOCUMENT_UPLOAD_MAX_LABEL } from '@/utils/uploadLimits'

export interface SignedParams {
  uploadUrl: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  publicId: string | null
  overwrite: boolean
}

export interface SideValue {
  localFile?: File
  localPreview?: string
  remoteUrl?: string
}

interface DocumentUploadPanelProps {
  bookingId: number
  purpose: string
  label: string
  sides: { key: string; label: string }[]
  onSidesChange: (values: Record<string, SideValue>) => void
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const ua = navigator.userAgent
    setMobile(/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || ('ontouchstart' in window && window.innerWidth < 1024))
  }, [])
  return mobile
}

export async function uploadSigned(file: File, params: SignedParams): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', params.apiKey)
  fd.append('timestamp', String(params.timestamp))
  fd.append('signature', params.signature)
  fd.append('folder', params.folder)
  if (params.publicId) fd.append('public_id', params.publicId)
  if (params.overwrite) fd.append('overwrite', 'true')
  const res = await fetch(params.uploadUrl, { method: 'POST', body: fd })
  if (!res.ok) {
    const text = await res.text()
    let msg = 'Upload thất bại'
    try { msg = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? msg } catch { /* ignore */ }
    throw new Error(msg)
  }
  const json = (await res.json()) as { secure_url?: string }
  if (!json.secure_url) throw new Error('Phản hồi không có URL ảnh')
  return json.secure_url
}

function SideUpload({
  sideLabel,
  bookingId,
  purpose,
  value,
  onChange,
  onClear,
}: {
  sideLabel: string
  bookingId: number
  purpose: string
  value: SideValue | null
  onChange: (v: SideValue) => void
  onClear: () => void
}) {
  const isMobile = useIsMobile()
  const [error, setError] = useState<string | null>(null)
  const [qrMode, setQrMode] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])
  useEffect(() => () => stopPolling(), [stopPolling])

  const handleLocalFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) { setError('Chỉ hỗ trợ file ảnh'); return }
      if (file.size > DOCUMENT_UPLOAD_MAX_BYTES) { setError(`File quá lớn (tối đa ${DOCUMENT_UPLOAD_MAX_LABEL})`); return }
      setError(null)
      const preview = URL.createObjectURL(file)
      onChange({ localFile: file, localPreview: preview })
    },
    [onChange],
  )

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) handleLocalFile(f)
      e.target.value = ''
    },
    [handleLocalFile],
  )

  const startQr = useCallback(async () => {
    setQrLoading(true)
    setError(null)
    try {
      const res = await contractService.createDocumentSession(bookingId, purpose)
      setQrUrl(res.qrUrl ?? null)
      setQrMode(true)
      pollRef.current = setInterval(async () => {
        try {
          const poll = await contractService.pollDocumentSession(res.sessionId)
          if (poll.status === 'COMPLETED' && poll.fileUrl) {
            stopPolling()
            onChange({ remoteUrl: poll.fileUrl })
            setQrMode(false)
          } else if (poll.status === 'EXPIRED') {
            stopPolling()
            setError('Session QR hết hạn.')
            setQrMode(false)
          }
        } catch {
          stopPolling()
          setError('Lỗi kiểm tra QR session.')
          setQrMode(false)
        }
      }, 2500)
    } catch {
      setError('Không thể tạo QR session.')
    } finally {
      setQrLoading(false)
    }
  }, [bookingId, purpose, onChange, stopPolling])

  const cancelQr = useCallback(() => { stopPolling(); setQrMode(false); setQrUrl(null) }, [stopPolling])

  const previewSrc = value?.localPreview ?? value?.remoteUrl ?? null
  const hasValue = !!previewSrc

  if (hasValue) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-800">{sideLabel}</span>
            {value?.localFile && !value?.remoteUrl && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">Sẵn sàng</span>
            )}
          </div>
          <button onClick={onClear} className="text-gray-400 hover:text-gray-600" title="Đổi ảnh">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <img src={previewSrc!} alt={sideLabel} className="h-20 rounded object-contain" />
      </div>
    )
  }

  if (qrMode && qrUrl) {
    return (
      <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-600">{sideLabel}</p>
        <div className="flex flex-col items-center gap-2">
          <QRCodeSVG value={qrUrl} size={140} />
          <p className="text-[11px] text-gray-500">Quét QR bằng điện thoại để chụp ảnh</p>
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <Spinner size="sm" />
            <span>Đang chờ...</span>
          </div>
          <Button variant="ghost" size="sm" onClick={cancelQr}>Huỷ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
      <p className="mb-2 text-xs font-medium text-gray-600">{sideLabel}</p>
      <div className="flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          Chọn ảnh
        </Button>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={() => cameraRef.current?.click()}>
            <Camera className="h-3.5 w-3.5" />
            Chụp
          </Button>
        )}
        {!isMobile && (
          <Button variant="ghost" size="sm" loading={qrLoading} onClick={startQr}>
            <QrCode className="h-3.5 w-3.5" />
            Chụp qua ĐT
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        {isMobile && <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function DocumentUploadPanel({ bookingId, purpose, label, sides, onSidesChange }: DocumentUploadPanelProps) {
  const [values, setValues] = useState<Record<string, SideValue>>({})

  const handleChange = useCallback(
    (key: string, v: SideValue) => {
      setValues((prev) => {
        const next = { ...prev, [key]: v }
        onSidesChange(next)
        return next
      })
    },
    [onSidesChange],
  )

  const handleClear = useCallback((key: string) => {
    setValues((prev) => {
      const next = { ...prev }
      if (next[key]?.localPreview) URL.revokeObjectURL(next[key].localPreview!)
      delete next[key]
      onSidesChange(next)
      return next
    })
  }, [onSidesChange])

  const doneCount = sides.filter((s) => !!values[s.key]).length

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></p>
        </div>
        <span className={`text-xs ${doneCount === sides.length ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
          {doneCount}/{sides.length} mặt
        </span>
      </div>
      <div className="grid gap-3">
        {sides.map((s) => (
          <SideUpload
            key={s.key}
            sideLabel={s.label}
            bookingId={bookingId}
            purpose={purpose}
            value={values[s.key] ?? null}
            onChange={(v) => handleChange(s.key, v)}
            onClear={() => handleClear(s.key)}
          />
        ))}
      </div>
    </div>
  )
}
