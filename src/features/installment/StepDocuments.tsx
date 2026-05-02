import { useState, useRef, useCallback } from 'react'
import {
  FileText, Upload, Trash2, FileImage, AlertCircle, CheckCircle2, Circle,
} from 'lucide-react'
import type { InstallmentDocumentDTO } from '@/services/installment.service'

const DOCUMENT_TYPES = [
  { value: 'CCCD_FRONT', label: 'CCCD / CMND — Mặt trước', required: true },
  { value: 'CCCD_BACK', label: 'CCCD / CMND — Mặt sau', required: true },
  { value: 'HOUSEHOLD_REG', label: 'Sổ hộ khẩu', required: true },
  { value: 'INCOME_PROOF', label: 'Bảng lương / Xác nhận thu nhập', required: true },
  { value: 'BANK_STATEMENT', label: 'Sao kê ngân hàng (3 tháng gần nhất)', required: false },
  { value: 'LABOR_CONTRACT', label: 'Hợp đồng lao động', required: false },
  { value: 'BUSINESS_LICENSE', label: 'Giấy phép kinh doanh', required: false },
  { value: 'BUSINESS_PHOTO', label: 'Ảnh cơ sở kinh doanh', required: false },
  { value: 'VEHICLE_CONTRACT', label: 'Hợp đồng mua xe', required: false },
  { value: 'DEPOSIT_RECEIPT', label: 'Biên nhận đặt cọc', required: false },
  { value: 'ASSET_PROOF', label: 'Giấy tờ tài sản', required: false },
  { value: 'OTHER', label: 'Tài liệu khác', required: false },
] as const

export { DOCUMENT_TYPES }
export const REQUIRED_DOCUMENT_TYPES = DOCUMENT_TYPES.filter((t) => t.required).map((t) => t.value)

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf'
const MAX_FILE_SIZE = 10 * 1024 * 1024
export interface PendingDocument {
  tempId: string
  file: File
  documentType: string
  previewUrl: string
  originalFileName: string
}

interface StepDocumentsProps {
  uploadedDocs: InstallmentDocumentDTO[]
  pendingDocs: PendingDocument[]
  onUploadedDocsChange: (docs: InstallmentDocumentDTO[]) => void
  onPendingDocsChange: (docs: PendingDocument[]) => void
  onDeleteUploaded?: (docId: number) => Promise<void>
  onUploadPendingDoc?: (doc: PendingDocument) => Promise<void>
}

export function StepDocuments({
  uploadedDocs, pendingDocs,
  onUploadedDocsChange, onPendingDocsChange, onDeleteUploaded,
  onUploadPendingDoc,
}: StepDocumentsProps) {
  const [deletingId, setDeletingId] = useState<number | string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allTypes = new Set([
    ...uploadedDocs.map((d) => d.documentType),
    ...pendingDocs.map((d) => d.documentType),
  ])

  const addFile = useCallback(async (files: FileList | null, type: string) => {
    if (!files || files.length === 0) return
    setError(null)
    const file = files[0]
    if (file.size > MAX_FILE_SIZE) { setError('File quá lớn. Tối đa 10MB.'); return }
    if (!ACCEPTED_TYPES.split(',').some((t) => file.type === t)) {
      setError('Chỉ chấp nhận JPG, PNG, WebP hoặc PDF.'); return
    }
    const pending: PendingDocument = {
      tempId: crypto.randomUUID(),
      file,
      documentType: type,
      previewUrl: URL.createObjectURL(file),
      originalFileName: file.name,
    }
    const nextPending = [...pendingDocs, pending]
    onPendingDocsChange(nextPending)
    if (type === 'DEPOSIT_RECEIPT' && onUploadPendingDoc) {
      try {
        await onUploadPendingDoc(pending)
      } catch {
        // keep pending state for manual retry path
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [pendingDocs, onPendingDocsChange, onUploadPendingDoc])

  const removePending = useCallback((tempId: string) => {
    const doc = pendingDocs.find((d) => d.tempId === tempId)
    if (doc) URL.revokeObjectURL(doc.previewUrl)
    onPendingDocsChange(pendingDocs.filter((d) => d.tempId !== tempId))
  }, [pendingDocs, onPendingDocsChange])

  const removeUploaded = useCallback(async (docId: number) => {
    if (!onDeleteUploaded) return
    setDeletingId(docId)
    try {
      await onDeleteUploaded(docId)
      onUploadedDocsChange(uploadedDocs.filter((d) => d.id !== docId))
    } catch {
      setError('Lỗi xoá file. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }, [uploadedDocs, onUploadedDocsChange, onDeleteUploaded])

  const docTypeLabel = (value: string) =>
    DOCUMENT_TYPES.find((t) => t.value === value)?.label ?? value

  const requiredDocs = DOCUMENT_TYPES.filter((t) => t.required)
  const requiredDone = requiredDocs.filter((t) => allTypes.has(t.value)).length

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hồ sơ & Tài liệu</h2>
          <p className="text-sm text-slate-500">Upload giấy tờ xác minh — {requiredDone}/{requiredDocs.length} bắt buộc</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Checklist tài liệu</h3>
        {DOCUMENT_TYPES.map((t) => {
          const done = allTypes.has(t.value)
          return (
            <div key={t.value} className="flex items-center gap-2.5 text-sm">
              {done
                ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
              <span className={done ? 'text-slate-700' : 'text-slate-500'}>{t.label}</span>
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.dataset.documentType = t.value
                  }
                  fileInputRef.current?.click()
                }}
                className="ml-auto rounded-md border border-slate-200 p-1 text-slate-500 transition-colors hover:border-primary/50 hover:text-primary"
                title={`Upload ${t.label}`}
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              {!done && t.required && (
                <span className="text-[10px] font-bold uppercase text-red-400">Bắt buộc</span>
              )}
              {done && (
                <span className="text-[10px] font-bold uppercase text-emerald-500">Đã có</span>
              )}
            </div>
          )
        })}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => addFile(e.target.files, e.currentTarget.dataset.documentType ?? DOCUMENT_TYPES[0].value)}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {(pendingDocs.length > 0 || uploadedDocs.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Tài liệu ({uploadedDocs.length + pendingDocs.length})
          </h3>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {pendingDocs.map((doc) => (
              <div key={doc.tempId} className="flex items-center gap-3 px-4 py-3">
                <FileImage className="h-8 w-8 shrink-0 text-amber-500/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.originalFileName}</p>
                  <p className="text-xs text-slate-500">{docTypeLabel(doc.documentType)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">Chờ gửi</span>
                <a href={doc.previewUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}>Xem</a>
                <button type="button" onClick={() => removePending(doc.tempId)}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {uploadedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <FileImage className="h-8 w-8 shrink-0 text-primary/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.originalFileName || 'Tài liệu'}</p>
                  <p className="text-xs text-slate-500">{docTypeLabel(doc.documentType)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Đã tải</span>
                <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}>Xem</a>
                {onDeleteUploaded && (
                  <button type="button" onClick={() => removeUploaded(doc.id)} disabled={deletingId === doc.id}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
