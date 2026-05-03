import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Button, Spinner } from '@/components/ui'
import { CLOUDINARY_SINGLE_IMAGE_MAX_BYTES, CLOUDINARY_SINGLE_IMAGE_MAX_LABEL } from '@/utils/uploadLimits'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export function MobileUploadPage() {
  const [params] = useSearchParams()
  const sessionId = params.get('session')
  const token = params.get('t')

  const [purpose, setPurpose] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'uploading' | 'done' | 'error' | 'expired'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId || !token) { setStatus('error'); setError('Link không hợp lệ.'); return }
    axios.get(`${API_BASE}/public/document-sessions/${sessionId}`, { params: { t: token } })
      .then((res) => {
        const data = (res.data as { data: { purpose: string; status: string } }).data
        if (data.status === 'EXPIRED') { setStatus('expired'); return }
        setPurpose(data.purpose)
        setStatus('ready')
      })
      .catch(() => { setStatus('error'); setError('Session không tồn tại hoặc đã hết hạn.') })
  }, [sessionId, token])

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > CLOUDINARY_SINGLE_IMAGE_MAX_BYTES) {
      setStatus('error')
      setError(`Ảnh quá lớn. Tối đa ${CLOUDINARY_SINGLE_IMAGE_MAX_LABEL}.`)
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
        formData,
        { params: { upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default' } },
      )
      const fileUrl = (uploadRes.data as { secure_url: string }).secure_url

      await axios.post(
        `${API_BASE}/public/document-sessions/${sessionId}/upload`,
        null,
        { params: { t: token, fileUrl } },
      )
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Tải ảnh thất bại. Vui lòng thử lại.')
    }
  }

  const purposeLabel: Record<string, string> = {
    CCCD: 'CCCD / CMND',
    LICENSE: 'Giấy phép lái xe',
    SIGNATURE: 'Chữ ký',
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#1A3C6E]">Chụp giấy tờ</h1>
          {purpose && <p className="mt-1 text-sm text-gray-600">{purposeLabel[purpose] ?? purpose}</p>}
        </div>

        {status === 'loading' && <div className="flex justify-center"><Spinner size="lg" /></div>}

        {status === 'ready' && (
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-white p-8 text-center transition hover:border-blue-500">
            <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Nhấn để chụp ảnh hoặc chọn từ thư viện</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
          </label>
        )}

        {status === 'uploading' && (
          <div className="space-y-3 text-center">
            {previewUrl && <img src={previewUrl} alt="preview" className="mx-auto h-40 rounded-lg object-contain" />}
            <div className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm text-gray-600">Đang tải lên...</span>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-4 text-center">
            {previewUrl && <img src={previewUrl} alt="uploaded" className="mx-auto h-40 rounded-lg object-contain" />}
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Tải lên thành công!</p>
              <p className="mt-1 text-xs text-green-600">Dữ liệu đã được đồng bộ về máy tính. Bạn có thể đóng trang này.</p>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="rounded-lg bg-yellow-50 p-4 text-center">
            <p className="text-sm font-medium text-yellow-800">Session đã hết hạn</p>
            <p className="mt-1 text-xs text-yellow-600">Vui lòng tạo mã QR mới từ máy tính.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3 text-center">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        )}
      </div>
    </div>
  )
}
