/**
 * Hiển thị lịch sử bảo dưỡng xe công khai (read-only, không form tạo mới).
 * Dùng trong tab "Lịch sử Bảo dưỡng" trên trang chi tiết xe.
 */
import { useState, useEffect, useCallback } from 'react'
import { Wrench } from 'lucide-react'
import { maintenanceService, type MaintenanceRecord } from '@/services/maintenance.service'

interface Props {
  vehicleId: number
}

// Format ngày dd/MM/yyyy
const fmtDate = (dateStr: string) => {
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

export function MaintenanceHistoryPublic({ vehicleId }: Props) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Gọi API lấy lịch sử bảo dưỡng
  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const page = await maintenanceService.getPublicHistory(vehicleId, 0, 50)
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

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  // Không có bản ghi
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
        <Wrench className="h-10 w-10" />
        <p className="text-sm">Chưa có bản ghi bảo dưỡng nào.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <Wrench className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">
          Lịch sử bảo dưỡng ({records.length} bản ghi)
        </h3>
      </div>

      {/* Bảng danh sách */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50/60">
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Ngày</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Mô tả</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Đơn vị thực hiện</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-700">
                  {fmtDate(r.maintenanceDate)}
                </td>
                <td className="px-4 py-2.5 text-slate-800">{r.description}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.performedBy ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
