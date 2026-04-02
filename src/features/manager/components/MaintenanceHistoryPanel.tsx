/**
 * MaintenanceHistoryPanel — Hiển thị lịch sử bảo dưỡng xe + form tạo mới.
 * Dùng trong VehicleDetailModal hoặc trang edit xe.
 */
import { useState, useEffect, useCallback } from 'react'
import { maintenanceService, type MaintenanceRecord, type CreateMaintenancePayload } from '@/services/maintenance.service'
import { Wrench, Plus, X } from 'lucide-react'

interface Props {
  vehicleId: number
}

export function MaintenanceHistoryPanel({ vehicleId }: Props) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Form fields
  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [performedBy, setPerformedBy] = useState('')

  // B1: Load lịch sử bảo dưỡng
  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const page = await maintenanceService.getHistory(vehicleId, 0, 50)
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

  // B2: Xử lý tạo bản ghi mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!maintenanceDate || !description || !cost) {
      setFormError('Vui lòng điền đầy đủ ngày, mô tả và chi phí.')
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateMaintenancePayload = {
        maintenanceDate,
        description,
        cost: Number(cost),
        performedBy: performedBy || undefined,
      }
      await maintenanceService.create(vehicleId, payload)
      // Reset form + reload
      setMaintenanceDate('')
      setDescription('')
      setCost('')
      setPerformedBy('')
      setShowForm(false)
      void loadHistory()
    } catch {
      setFormError('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  // B3: Format currency
  const fmtCost = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Lịch sử bảo dưỡng</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-[#1A3C6E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90"
        >
          {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showForm ? 'Hủy' : 'Thêm mới'}
        </button>
      </div>

      {/* Form tạo mới */}
      {showForm && (
        <form onSubmit={(e) => void handleSubmit(e)} className="border-b border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Ngày bảo dưỡng *</label>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Chi phí (VNĐ) *</label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Mô tả công việc *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
                placeholder="Thay dầu, sửa phanh, bảo dưỡng định kỳ..."
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Đơn vị thực hiện</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="Garage XYZ, Toyota Đà Nẵng..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
              />
            </div>
          </div>
          {formError && <p className="mt-2 text-xs text-red-500">{formError}</p>}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu bản ghi'}
            </button>
          </div>
        </form>
      )}

      {/* Danh sách */}
      <div className="max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Chưa có bản ghi bảo dưỡng nào.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-100/60">
                <th className="px-4 py-2 text-xs font-semibold text-slate-500">Ngày</th>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500">Mô tả</th>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500">Chi phí</th>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500">Đơn vị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-slate-700">
                    {r.maintenanceDate}
                  </td>
                  <td className="px-4 py-2 text-slate-800">{r.description}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-emerald-700">
                    {fmtCost(r.cost)}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{r.performedBy ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
