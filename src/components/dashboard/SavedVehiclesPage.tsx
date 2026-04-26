/**
 * Tier 3.1 — Trang Xe đã lưu (dashboard /dashboard/saved)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SavedVehicleGrid } from '@/features/customer/components/SavedVehicleGrid'
import { useSavedVehicles } from '@/hooks/useSavedVehicles'

const tabFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Đang bán' },
  { key: 'sold', label: 'Đã bán' },
] as const

export function SavedVehiclesDashboardPage() {
  const [tab, setTab] = useState<string>('all')
  const { savedVehicles: vehicles, isLoading, error, removeVehicle } = useSavedVehicles()

  const allVehicles = vehicles ?? []
  const filtered =
    tab === 'all'
      ? allVehicles
      : tab === 'available'
        ? allVehicles.filter((v) => v.status === 'Available' || v.status === 'Reserved' || v.status === 'InTransfer')
        : allVehicles.filter((v) => v.status === 'Sold')

  const availableCount = allVehicles.filter(
    (v) => v.status === 'Available' || v.status === 'Reserved' || v.status === 'InTransfer'
  ).length
  const soldCount = allVehicles.filter((v) => v.status === 'Sold').length

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="transition-colors hover:text-[#1A3C6E]">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/dashboard" className="transition-colors hover:text-[#1A3C6E]">
          Bảng điều khiển
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Xe đã lưu</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Xe đã lưu</h1>
        <p className="text-slate-500">
          Bạn đã lưu <span className="font-bold text-[#1A3C6E]">{allVehicles.length}</span> phương tiện đang quan tâm tại
          khu vực Đà Nẵng.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        {tabFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setTab(f.key)}
            className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              tab === f.key
                ? 'border-[#1A3C6E] font-bold text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-[#1A3C6E]'
            }`}
          >
            {f.key === 'all'
              ? `Tất cả (${allVehicles.length})`
              : f.key === 'available'
                ? `Đang bán (${availableCount})`
                : `Đã bán (${soldCount})`}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <SavedVehicleGrid
          vehicles={filtered}
          isLoading={isLoading}
          onRemoveSaved={removeVehicle}
        />
      )}

      <div className="mt-12 flex flex-col items-center rounded-2xl border-2 border-dashed border-[#1A3C6E]/20 bg-[#1A3C6E]/5 p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h4 className="mb-2 text-xl font-bold">Tìm thêm xe phù hợp?</h4>
        <p className="mb-6 max-w-md text-slate-500">
          Tiếp tục khám phá hàng nghìn mẫu xe đang được đăng bán tại Đà Nẵng với mức giá tốt nhất.
        </p>
        <Link
          to="/vehicles"
          className="rounded-xl bg-[#1A3C6E] px-8 py-3 font-bold text-white transition-all hover:shadow-lg active:scale-95"
        >
          Khám phá ngay
        </Link>
      </div>
    </div>
  )
}
