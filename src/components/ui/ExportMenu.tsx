// Dropdown menu cho nút xuất Excel — cho phép chọn "Xuất tất cả" hoặc "Chọn dòng để xuất".
import { useEffect, useRef, useState } from 'react'
import { Download, ChevronDown, CheckSquare } from 'lucide-react'

interface ExportMenuProps {
  onExportAll: () => void
  onExportFiltered: () => void
  disabled?: boolean
  label?: string
  filteredLabel?: string
}

export function ExportMenu({
  onExportAll,
  onExportFiltered,
  disabled = false,
  label = 'Xuất Excel',
  filteredLabel = 'Chọn dòng để xuất',
}: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { onExportAll(); setOpen(false) }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-slate-400" />
            Xuất tất cả
          </button>
          <button
            type="button"
            onClick={() => { onExportFiltered(); setOpen(false) }}
            className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <CheckSquare className="h-4 w-4 text-slate-400" />
            {filteredLabel}
          </button>
        </div>
      )}
    </div>
  )
}
