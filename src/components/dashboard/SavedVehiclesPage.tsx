/**
 * Tier 3.1 — Trang Xe đã lưu (dashboard /dashboard/saved)
 */
import { useMemo, useState } from 'react'
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
  const [yearFilter, setYearFilter] = useState('')
  const [fuelFilter, setFuelFilter] = useState('')
  const [transmissionFilter, setTransmissionFilter] = useState('')
  const [engineQuery, setEngineQuery] = useState('')
  const { savedVehicles: vehicles, isLoading, error, removeVehicle } = useSavedVehicles()

  const allVehicles = vehicles
  const yearOptions = useMemo(
    () => Array.from(new Set(allVehicles.map((v) => v.year).filter(Boolean))).sort((a, b) => b - a),
    [allVehicles],
  )
  const fuelOptions = useMemo(
    () => Array.from(new Set(allVehicles.map((v) => v.fuel).filter((value): value is string => Boolean(value && value !== '—')))).sort(),
    [allVehicles],
  )
  const transmissionOptions = useMemo(
    () => Array.from(new Set(allVehicles.map((v) => v.transmission).filter((value): value is string => Boolean(value && value !== '—')))).sort(),
    [allVehicles],
  )
  const filtered = useMemo(() => {
    const statusFiltered =
      tab === 'all'
        ? allVehicles
        : tab === 'available'
          ? allVehicles.filter((v) => v.status === 'Available' || v.status === 'Reserved' || v.status === 'InTransfer')
          : allVehicles.filter((v) => v.status === 'Sold')

    const engineText = engineQuery.trim().toLowerCase()
    return statusFiltered.filter((vehicle) => {
      if (yearFilter && String(vehicle.year) !== yearFilter) return false
      if (fuelFilter && vehicle.fuel !== fuelFilter) return false
      if (transmissionFilter && vehicle.transmission !== transmissionFilter) return false
      if (engineText) {
        const haystack = `${vehicle.engine ?? ''} ${vehicle.title ?? ''} ${vehicle.listing_id ?? ''}`.toLowerCase()
        if (!haystack.includes(engineText)) return false
      }
      return true
    })
  }, [allVehicles, engineQuery, fuelFilter, tab, transmissionFilter, yearFilter])

  const availableCount = allVehicles.filter(
    (v) => v.status === 'Available' || v.status === 'Reserved' || v.status === 'InTransfer'
  ).length
  const soldCount = allVehicles.filter((v) => v.status === 'Sold').length
  const hasAdvancedFilters = Boolean(yearFilter || fuelFilter || transmissionFilter || engineQuery.trim())
  const clearFilters = () => {
    setTab('all')
    setYearFilter('')
    setFuelFilter('')
    setTransmissionFilter('')
    setEngineQuery('')
  }

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

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Năm sản xuất</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
            >
              <option value="">Tất cả năm</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Nhiên liệu</span>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
            >
              <option value="">Tất cả nhiên liệu</option>
              {fuelOptions.map((fuel) => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Hộp số</span>
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
            >
              <option value="">Tất cả hộp số</option>
              {transmissionOptions.map((transmission) => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Động cơ / từ khóa</span>
            <input
              value={engineQuery}
              onChange={(e) => setEngineQuery(e.target.value)}
              placeholder="VD: 1.5L, Hybrid..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>Hiển thị {filtered.length} / {allVehicles.length} xe đã lưu</span>
          {hasAdvancedFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#1A3C6E] hover:underline"
            >
              Xóa lọc
            </button>
          )}
        </div>
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
