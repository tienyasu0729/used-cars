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

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const inputCls = 'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

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
}

export function StepDocuments({
  uploadedDocs, pendingDocs,
  onUploadedDocsChange, onPendingDocsChange, onDeleteUploaded,
}: StepDocumentsProps) {
  const [selectedType, setSelectedType] = useState<string>(DOCUMENT_TYPES[0].value)
  const [deletingId, setDeletingId] = useState<number | string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allTypes = new Set([
    ...uploadedDocs.map(d => d.documentType),
    ...pendingDocs.map(d => d.documentType),
  ])

  const addFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    const file = files[0]
    if (file.size > MAX_FILE_SIZE) { setError('File quá lớn. Tối đa 10MB.'); return }
    if (!ACCEPTED_TYPES.split(',').some(t => file.type === t)) {
      setError('Chỉ chấp nhận JPG, PNG, WebP hoặc PDF.'); return
    }
    const pending: PendingDocument = {
      tempId: crypto.randomUUID(),
      file,
      documentType: selectedType,
      previewUrl: URL.createObjectURL(file),
      originalFileName: file.name,
    }
    onPendingDocsChange([...pendingDocs, pending])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [selectedType, pendingDocs, onPendingDocsChange])

  const removePending = useCallback((tempId: string) => {
    const doc = pendingDocs.find(d => d.tempId === tempId)
    if (doc) URL.revokeObjectURL(doc.previewUrl)
    onPendingDocsChange(pendingDocs.filter(d => d.tempId !== tempId))
  }, [pendingDocs, onPendingDocsChange])

  const removeUploaded = useCallback(async (docId: number) => {
    if (!onDeleteUploaded) return
    setDeletingId(docId)
    try {
      await onDeleteUploaded(docId)
      onUploadedDocsChange(uploadedDocs.filter(d => d.id !== docId))
    } catch {
      setError('Lỗi xoá file. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }, [uploadedDocs, onUploadedDocsChange, onDeleteUploaded])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); addFile(e.dataTransfer.files)
  }, [addFile])

  const docTypeLabel = (value: string) =>
    DOCUMENT_TYPES.find(t => t.value === value)?.label ?? value

  const requiredDocs = DOCUMENT_TYPES.filter(t => t.required)
  const requiredDone = requiredDocs.filter(t => allTypes.has(t.value)).length

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hồ sơ & Tài liệu</h2>
          <p className="text-sm text-slate-500">Upload giấy tờ xác minh — {requiredDone}/{requiredDocs.length} bắt buộc</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Checklist tài liệu</h3>
        {DOCUMENT_TYPES.map(t => {
          const done = allTypes.has(t.value)
          return (
            <div key={t.value} className="flex items-center gap-2.5 text-sm">
              {done
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                : <Circle className="h-4 w-4 text-slate-300 shrink-0" />}
              <span className={done ? 'text-slate-700' : 'text-slate-500'}>{t.label}</span>
              {t.required && !done && (
                <span className="ml-auto text-[10px] font-bold text-red-400 uppercase">Bắt buộc</span>
              )}
              {t.required && done && (
                <span className="ml-auto text-[10px] font-bold text-emerald-500 uppercase">Đã có</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Loại tài liệu</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={inputCls}>
            {DOCUMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50 hover:border-primary/50 hover:bg-primary/5'
        }`}
      >
        <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} className="hidden"
          onChange={e => addFile(e.target.files)} />
        <Upload className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-600">
          Kéo thả file vào đây hoặc <span className="text-primary">nhấn để chọn</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">JPG, PNG, WebP, PDF — tối đa 10MB · File sẽ được tải lên khi gửi hồ sơ</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {(pendingDocs.length > 0 || uploadedDocs.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Tài liệu ({uploadedDocs.length + pendingDocs.length})
          </h3>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {pendingDocs.map(doc => (
              <div key={doc.tempId} className="flex items-center gap-3 px-4 py-3">
                <FileImage className="h-8 w-8 shrink-0 text-amber-500/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.originalFileName}</p>
                  <p className="text-xs text-slate-500">{docTypeLabel(doc.documentType)}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Chờ gửi</span>
                <a href={doc.previewUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                  onClick={e => e.stopPropagation()}>Xem</a>
                <button type="button" onClick={() => removePending(doc.tempId)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {uploadedDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <FileImage className="h-8 w-8 shrink-0 text-primary/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.originalFileName || 'Tài liệu'}</p>
                  <p className="text-xs text-slate-500">{docTypeLabel(doc.documentType)}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Đã tải</span>
                <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                  onClick={e => e.stopPropagation()}>Xem</a>
                {onDeleteUploaded && (
                  <button type="button" onClick={() => removeUploaded(doc.id)} disabled={deletingId === doc.id}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 cursor-pointer">
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
