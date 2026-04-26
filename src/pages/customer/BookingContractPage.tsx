import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { contractService } from '@/services/contract.service'
import { SignaturePad } from '@/components/contract/SignaturePad'
import { DocumentUploadPanel, uploadSigned } from '@/components/contract/DocumentUploadPanel'
import type { SideValue, SignedParams } from '@/components/contract/DocumentUploadPanel'
import { Button, Spinner } from '@/components/ui'
import type { ContractPreview, CloudinarySignedUpload } from '@/types/contract.types'

const ID_CARD_SIDES = [
  { key: 'idCardFront', label: 'Mặt trước' },
  { key: 'idCardBack', label: 'Mặt sau' },
]
const LICENSE_SIDES = [
  { key: 'licenseFront', label: 'Mặt trước' },
  { key: 'licenseBack', label: 'Mặt sau' },
]

function sideReady(v: SideValue | undefined): boolean {
  if (!v) return false
  return !!(v.remoteUrl || v.localFile)
}

export function BookingContractPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bookingId = Number(id)

  const [preview, setPreview] = useState<ContractPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw')
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [typedName, setTypedName] = useState('')
  const [idCardValues, setIdCardValues] = useState<Record<string, SideValue>>({})
  const [licenseValues, setLicenseValues] = useState<Record<string, SideValue>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const signedCacheRef = useRef<Record<string, CloudinarySignedUpload> | null>(null)

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    contractService.getContractPreview(bookingId)
      .then(setPreview)
      .catch(() => setError('Không tải được hợp đồng.'))
      .finally(() => setLoading(false))
  }, [bookingId])

  const fetchSignedParams = useCallback(async (sideKey: string): Promise<SignedParams | null> => {
    try {
      if (!signedCacheRef.current) {
        signedCacheRef.current = await contractService.getSignatureUploadUrls(bookingId)
      }
      const cache = signedCacheRef.current
      if (sideKey.startsWith('idCard')) return (cache['idCard'] as unknown as SignedParams) ?? null
      if (sideKey.startsWith('license')) return (cache['license'] as unknown as SignedParams) ?? null
      return (cache['signature'] as unknown as SignedParams) ?? null
    } catch {
      signedCacheRef.current = null
      return null
    }
  }, [bookingId])

  const hasSignature = useMemo(() => {
    if (signatureType === 'draw') return !!signatureDataUrl
    return typedName.trim().length > 0
  }, [signatureType, signatureDataUrl, typedName])

  const idCardComplete = ID_CARD_SIDES.every((s) => sideReady(idCardValues[s.key]))
  const licenseComplete = LICENSE_SIDES.every((s) => sideReady(licenseValues[s.key]))
  const docsComplete = idCardComplete && licenseComplete

  const canSubmit = agreed && hasSignature && docsComplete && !submitting

  const resolveUrls = useCallback(
    async (sides: { key: string }[], values: Record<string, SideValue>): Promise<string[]> => {
      const urls: string[] = []
      for (const s of sides) {
        const v = values[s.key]
        if (!v) throw new Error(`Thiếu ảnh: ${s.key}`)
        if (v.remoteUrl) {
          urls.push(v.remoteUrl)
        } else if (v.localFile) {
          const params = await fetchSignedParams(s.key)
          if (!params) throw new Error('Không lấy được thông tin upload.')
          const url = await uploadSigned(v.localFile, params)
          urls.push(url)
        }
      }
      return urls
    },
    [fetchSignedParams],
  )

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    const sigUrl = signatureType === 'draw' ? signatureDataUrl : typedName.trim()
    if (!sigUrl) return

    setSubmitting(true)
    setError(null)
    try {
      setUploadProgress('Đang tải ảnh CCCD...')
      const idUrls = await resolveUrls(ID_CARD_SIDES, idCardValues)

      setUploadProgress('Đang tải ảnh GPLX...')
      const licUrls = await resolveUrls(LICENSE_SIDES, licenseValues)

      setUploadProgress('Đang hoàn tất hợp đồng...')
      await contractService.completeContract(bookingId, {
        agreed: true,
        signatureType,
        signatureUrl: sigUrl,
        idCardUrl: idUrls.join('|'),
        licenseUrl: licUrls.join('|'),
      })
      navigate('/dashboard/bookings')
    } catch (e) {
      setError((e as Error).message || 'Không thể hoàn tất hợp đồng. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
      setUploadProgress(null)
    }
  }, [canSubmit, signatureType, signatureDataUrl, typedName, idCardValues, licenseValues, bookingId, navigate, resolveUrls])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!preview) return <div className="py-10 text-center text-gray-500">{error ?? 'Không tìm thấy hợp đồng.'}</div>

  if (preview.contractStatus === 'SIGNED') {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <h1 className="text-xl font-bold text-green-700">Hợp đồng đã ký thành công</h1>
        <p className="text-sm text-gray-600">Hash: {preview.contentSha256}</p>
        <p className="text-sm text-gray-600">Thời điểm: {preview.signedAt}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/bookings')}>Về danh sách lịch hẹn</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <h1 className="text-2xl font-bold text-[#1A3C6E]">Hợp đồng lái thử xe</h1>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Thông tin lái thử</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Khách hàng:</span> {preview.customerName}</div>
          <div><span className="text-gray-500">Điện thoại:</span> {preview.customerPhone}</div>
          <div><span className="text-gray-500">Xe:</span> {preview.vehicleTitle}</div>
          <div><span className="text-gray-500">Chi nhánh:</span> {preview.branchName}</div>
          <div><span className="text-gray-500">Ngày:</span> {preview.bookingDate}</div>
          <div><span className="text-gray-500">Giờ:</span> {preview.timeSlot}</div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Điều khoản hợp đồng</h2>
        <div className="max-h-64 overflow-y-auto rounded bg-gray-50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {preview.termsContent}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#1A3C6E]" />
          <span className="text-sm font-medium">Tôi đã đọc và đồng ý với các điều khoản trên</span>
        </label>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">
          Chữ ký <span className="text-red-500">*</span>
        </h2>
        <div className="mb-3 flex gap-3">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${signatureType === 'draw' ? 'bg-[#1A3C6E] text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setSignatureType('draw')}
          >
            Vẽ chữ ký
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${signatureType === 'type' ? 'bg-[#1A3C6E] text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setSignatureType('type')}
          >
            Nhập tên
          </button>
        </div>
        {signatureType === 'draw' ? (
          <SignaturePad initialDataUrl={signatureDataUrl} onSignatureChange={setSignatureDataUrl} />
        ) : (
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Nhập họ tên đầy đủ"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg italic focus:border-[#1A3C6E] focus:outline-none"
          />
        )}
        {!hasSignature && (
          <p className="mt-2 text-xs text-amber-600">
            {signatureType === 'draw' ? 'Vui lòng vẽ chữ ký trước khi tiếp tục.' : 'Vui lòng nhập họ tên đầy đủ.'}
          </p>
        )}
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">
          Giấy tờ <span className="text-red-500">*</span>
        </h2>
        <p className="mb-4 text-xs text-gray-500">Mỗi giấy tờ cần chụp cả 2 mặt (trước + sau).</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <DocumentUploadPanel
            bookingId={bookingId}
            purpose="CCCD"
            label="CCCD / CMND"
            sides={ID_CARD_SIDES}
            onSidesChange={setIdCardValues}
          />
          <DocumentUploadPanel
            bookingId={bookingId}
            purpose="LICENSE"
            label="Giấy phép lái xe"
            sides={LICENSE_SIDES}
            onSidesChange={setLicenseValues}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!canSubmit && !submitting && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Vui lòng hoàn tất trước khi ký:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {!agreed && <li>Đánh dấu đồng ý điều khoản</li>}
            {!hasSignature && <li>Ký tên (vẽ hoặc nhập họ tên)</li>}
            {!idCardComplete && <li>Chụp / tải ảnh CCCD (2 mặt)</li>}
            {!licenseComplete && <li>Chụp / tải ảnh giấy phép lái xe (2 mặt)</li>}
          </ul>
        </div>
      )}

      {uploadProgress && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Spinner size="sm" />
          <span>{uploadProgress}</span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={submitting} onClick={() => navigate('/dashboard/bookings')}>Huỷ</Button>
        <Button loading={submitting} disabled={!canSubmit} onClick={handleSubmit}>
          Ký hợp đồng & Xác nhận
        </Button>
      </div>
    </div>
  )
}
