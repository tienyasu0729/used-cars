import { useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { ChevronDown, ChevronUp, Plus, Upload, Wrench, X } from 'lucide-react'
import { maintenanceService, type CreateMaintenancePayload, type MaintenanceRecord } from '@/services/maintenance.service'

interface Props {
  vehicleId: number
}

type ParsedRow = CreateMaintenancePayload & { idx: number }

export function MaintenanceHistoryPanel({ vehicleId }: Props) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [formError, setFormError] = useState('')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])

  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [performedBy, setPerformedBy] = useState('')

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const page = await maintenanceService.getHistory(vehicleId, 0, 200)
      setRecords(page.content ?? [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const visibleRows = useMemo(() => (expanded ? records : records.slice(0, 10)), [expanded, records])

  const fmtCost = (v: number) => new Intl.NumberFormat('vi-VN').format(v)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!maintenanceDate || !description.trim()) {
      setFormError('Vui lòng nhập ngày và mô tả bảo dưỡng.')
      return
    }
    setSubmitting(true)
    try {
      await maintenanceService.create(vehicleId, {
        maintenanceDate,
        description: description.trim(),
        cost: Number(cost) || 0,
        performedBy: performedBy.trim() || undefined,
      })
      setMaintenanceDate('')
      setDescription('')
      setCost('')
      setPerformedBy('')
      setShowForm(false)
      await loadHistory()
    } catch {
      setFormError('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const onImportExcel = useCallback(async (file: File) => {
    setFormError('')
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      const parsed: ParsedRow[] = rows
        .map((r, idx) => {
          const dateRaw = String(r.ngay ?? r.Ngay ?? r.date ?? r.Date ?? '').trim()
          const descRaw = String(r.mo_ta ?? r['Mô tả'] ?? r.moTa ?? r.description ?? '').trim()
          const costRaw = String(r.chi_phi ?? r['Chi phí'] ?? r.cost ?? '0').trim()
          const byRaw = String(r.nguoi_thuc_hien ?? r['Người thực hiện'] ?? r.performedBy ?? '').trim()
          return {
            idx: idx + 1,
            maintenanceDate: dateRaw,
            description: descRaw,
            cost: Number(costRaw.replace(/[^\d.-]/g, '')) || 0,
            performedBy: byRaw,
          }
        })
        .filter((x) => x.maintenanceDate && x.description)
      setParsedRows(parsed)
      if (parsed.length === 0) setFormError('Không có dòng hợp lệ trong file Excel.')
    } catch {
      setFormError('Không đọc được file Excel.')
    }
  }, [])

  const submitImportedRows = useCallback(async () => {
    if (parsedRows.length === 0) return
    setImporting(true)
    setFormError('')
    try {
      await maintenanceService.bulkCreate(
        vehicleId,
        parsedRows.map(({ maintenanceDate, description, cost, performedBy }) => ({
          maintenanceDate,
          description,
          cost,
          performedBy,
        })),
      )
      setParsedRows([])
      await loadHistory()
    } catch {
      setFormError('Import bảo dưỡng thất bại.')
    } finally {
      setImporting(false)
    }
  }, [loadHistory, parsedRows, vehicleId])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Lịch sử bảo dưỡng</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Thu gọn' : 'Mở rộng'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg bg-[#1A3C6E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1A3C6E]/90"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? 'Hủy' : 'Thêm mới'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Ngày</th>
                  <th className="px-3 py-2 text-left">Mô tả</th>
                  <th className="px-3 py-2 text-right">Chi phí</th>
                  <th className="px-3 py-2 text-left">Người thực hiện</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{r.maintenanceDate}</td>
                    <td className="px-3 py-2">{r.description}</td>
                    <td className="px-3 py-2 text-right">{fmtCost(Number(r.cost || 0))}</td>
                    <td className="px-3 py-2">{r.performedBy || '—'}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500">Chưa có dữ liệu bảo dưỡng.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {records.length > 10 && !expanded && (
            <p className="mt-2 text-xs text-slate-500">Đang hiển thị 10/{records.length} dòng.</p>
          )}
        </>
      )}

      {showForm && (
        <form onSubmit={(e) => void handleCreate(e)} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
              <Upload className="h-3.5 w-3.5" />
              Import Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void onImportExcel(f)
                  e.currentTarget.value = ''
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => void submitImportedRows()}
              disabled={importing || parsedRows.length === 0}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {importing ? 'Đang import...' : `Import ${parsedRows.length} dòng`}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input type="date" value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="text" inputMode="numeric" placeholder="Chi phí" value={cost} onChange={(e) => setCost(e.target.value.replace(/[^\d]/g, ''))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="text" placeholder="Mô tả bảo dưỡng" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
            <input type="text" placeholder="Người thực hiện" value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          </div>
          {formError && <p className="mt-2 text-xs text-red-500">{formError}</p>}
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {submitting ? 'Đang lưu...' : 'Lưu bản ghi'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
