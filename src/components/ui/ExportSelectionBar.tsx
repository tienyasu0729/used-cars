// Thanh hành động xuất hiện khi người dùng bật chế độ chọn dòng để xuất.
// Hiển thị: số dòng đã chọn, nút Chọn tất cả / Bỏ chọn, nút Xuất, nút Hủy.
import { Download, X, CheckSquare } from 'lucide-react'

interface ExportSelectionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onExport: () => void
  onCancel: () => void
}

export function ExportSelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onExport,
  onCancel,
}: ExportSelectionBarProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
      <CheckSquare className="h-5 w-5 text-blue-600" />
      <span className="text-sm font-semibold text-blue-900">
        Đã chọn {selectedCount} / {totalCount} dòng
      </span>

      <button
        type="button"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100"
      >
        {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Xuất {selectedCount > 0 ? `(${selectedCount})` : ''}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Hủy
        </button>
      </div>
    </div>
  )
}
