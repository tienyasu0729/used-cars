import { useEffect, useRef, useState } from 'react'
import { Filter } from 'lucide-react'

export type DashboardDatePreset = '30' | 'q3' | 'custom'

export interface DashboardFilterBranchOption {
  id: string
  name: string
}

interface AdminDashboardFiltersProps {
  datePreset: DashboardDatePreset
  onDatePresetChange: (p: DashboardDatePreset) => void
  customFrom: string
  customTo: string
  onCustomFrom: (v: string) => void
  onCustomTo: (v: string) => void
  branchId: 'all' | string
  onBranchId: (id: 'all' | string) => void
  branches: DashboardFilterBranchOption[]
}

const btnBase =
  'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3C6E] focus-visible:ring-offset-2'
const btnInactive = 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
const btnActive = 'bg-[#1A3C6E] text-white'

export function AdminDashboardFilters({
  datePreset,
  onDatePresetChange,
  customFrom,
  customTo,
  onCustomFrom,
  onCustomTo,
  branchId,
  onBranchId,
  branches,
}: AdminDashboardFiltersProps) {
  const [branchOpen, setBranchOpen] = useState(false)
  const branchWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!branchOpen) return
    const onDown = (e: MouseEvent) => {
      if (branchWrapRef.current && !branchWrapRef.current.contains(e.target as Node)) {
        setBranchOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [branchOpen])

  const branchLabel =
    branchId === 'all'
      ? 'Tất cả chi nhánh'
      : branches.find((b) => b.id === branchId)?.name ?? 'Chi nhánh'

  return (
    <div className="relative z-20 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onDatePresetChange('30')}
          className={`${btnBase} ${datePreset === '30' ? btnActive : btnInactive}`}
        >
          30 ngày qua
        </button>
        <button
          type="button"
          onClick={() => onDatePresetChange('q3')}
          className={`${btnBase} ${datePreset === 'q3' ? btnActive : btnInactive}`}
        >
          Q3 2025
        </button>
        <button
          type="button"
          onClick={() => onDatePresetChange('custom')}
          className={`${btnBase} ${datePreset === 'custom' ? btnActive : btnInactive}`}
        >
          Tùy chọn
        </button>
        <div className="relative" ref={branchWrapRef}>
          <button
            type="button"
            aria-expanded={branchOpen}
            aria-haspopup="listbox"
            onClick={() => setBranchOpen((o) => !o)}
            className={`flex items-center gap-2 ${btnBase} ${btnInactive}`}
          >
            <Filter className="h-4 w-4 shrink-0" />
            <span className="max-w-[200px] truncate">{branchLabel}</span>
          </button>
          {branchOpen && (
            <ul
              className="absolute right-0 top-full z-[60] mt-1 max-h-56 min-w-[220px] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              <li>
                <button
                  type="button"
                  role="option"
                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    onBranchId('all')
                    setBranchOpen(false)
                  }}
                >
                  Tất cả chi nhánh
                </button>
              </li>
              {branches.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    role="option"
                    className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      onBranchId(b.id)
                      setBranchOpen(false)
                    }}
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {datePreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            Từ
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFrom(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-900"
            />
          </label>
          <label className="flex items-center gap-2 text-slate-600">
            Đến
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomTo(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-900"
            />
          </label>
        </div>
      )}
    </div>
  )
}
