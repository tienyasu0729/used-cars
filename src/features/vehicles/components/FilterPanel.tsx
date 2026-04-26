/**
 * FilterPanel — Bộ lọc xe dùng trong trang listing
 *
 * Fetch hãng xe từ API /catalog/categories
 * Cascade: chọn hãng → fetch dòng xe /catalog/subcategories
 * Giá: 2 input + thanh trượt kép (đồng bộ với input)
 * TODO: Nhiên liệu, hộp số → filter client-side khi backend chưa hỗ trợ
 */
import { useState, useEffect, useMemo } from 'react'
import { Car, DollarSign, Calendar, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCatalog } from '@/hooks/useCatalog'
import { useVehicleRegistryLabels } from '@/hooks/useVehicleRegistryLabels'
import type { VehicleListingFacets } from '@/hooks/useVehicleListingFacets'
import type { VehicleSearchParams } from '@/types/vehicle.types'

interface FilterPanelProps {
  inline?: boolean
  onFilterChange?: (params: VehicleSearchParams) => void
  /** Chỉ hiển thị hãng/dòng đang có xe; biên độ giá cho slider */
  facets?: VehicleListingFacets
  /** Giá trị filter ban đầu từ URL (vd. khi tìm theo giá từ trang chủ) */
  initialFilters?: Partial<VehicleSearchParams>
}

function parsePriceInput(s: string, fallback: number): number {
  if (s === '') return fallback
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? fallback : n
}

/** Thanh kép: luôn trượt từ 0 → ceil (VNĐ). Nút min đặt z cao hơn để dễ kéo cạnh trái. */
function PriceDualRange({
  ceil,
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  disabled,
}: {
  ceil: number
  minPrice: string
  maxPrice: string
  onMinChange: (v: string) => void
  onMaxChange: (v: string) => void
  disabled?: boolean
}) {
  const floor = 0
  const span = Math.max(ceil - floor, 1)
  const step = Math.max(1_000_000, Math.round(span / 150) || 1_000_000)
  const minThumb = Math.min(Math.max(parsePriceInput(minPrice, floor), floor), ceil)
  const maxThumb = Math.min(Math.max(parsePriceInput(maxPrice, ceil), floor), ceil)

  const rangeClass =
    'pointer-events-none absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent disabled:opacity-40 ' +
    '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-4 ' +
    '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#1A3C6E] ' +
    '[&::-webkit-slider-thumb]:shadow-md [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent ' +
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 ' +
    '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full ' +
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#1A3C6E]'

  const off = disabled || ceil < 1

  return (
    <div className="relative mt-3 h-10">
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200"
        aria-hidden
      />
      {/* Giá tối đa: layer dưới */}
      <input
        type="range"
        min={floor}
        max={ceil}
        step={step}
        value={maxThumb}
        disabled={off}
        onChange={(e) => {
          const v = Number(e.target.value)
          const currentMin = parsePriceInput(minPrice, floor)
          if (v < currentMin) onMinChange(String(v))
          onMaxChange(String(v))
        }}
        className={`${rangeClass} z-[1]`}
        aria-label="Giá tối đa (kéo)"
      />
      {/* Giá tối thiểu: layer trên — kéo từ 0 */}
      <input
        type="range"
        min={floor}
        max={ceil}
        step={step}
        value={minThumb}
        disabled={off}
        onChange={(e) => {
          const v = Number(e.target.value)
          const currentMax = parsePriceInput(maxPrice, ceil)
          if (v > currentMax) onMaxChange(String(v))
          onMinChange(String(v))
        }}
        className={`${rangeClass} z-[2]`}
        aria-label="Giá tối thiểu (kéo từ 0)"
      />
    </div>
  )
}

const CURRENT_YEAR = new Date().getFullYear().toString()

export function FilterPanel({ inline, onFilterChange, facets, initialFilters }: FilterPanelProps) {
  const { categories, subcategories, isLoadingCategories, fetchSubcategories } = useCatalog()
  const { transmissionOptions } = useVehicleRegistryLabels()

  // Local state cho form — mặc định: Giá từ = 0, Năm đến = năm hiện tại
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('')
  const [selectedModel, setSelectedModel] = useState<number | ''>('')
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState(CURRENT_YEAR)
  const [selectedTransmission, setSelectedTransmission] = useState('')
  const [initialSynced, setInitialSynced] = useState(false)

  // Đồng bộ filter ban đầu từ URL (vd. mức giá chọn ở trang chủ) vào form — chỉ chạy 1 lần
  useEffect(() => {
    if (initialSynced || !initialFilters) return
    setInitialSynced(true)
    if (initialFilters.minPrice != null) setMinPrice(String(initialFilters.minPrice))
    if (initialFilters.maxPrice != null) setMaxPrice(String(initialFilters.maxPrice))
    if (initialFilters.brand != null) setSelectedBrand(initialFilters.brand)
    if (initialFilters.subcategoryId != null) setSelectedModel(initialFilters.subcategoryId)
    if (initialFilters.yearMin != null) setMinYear(String(initialFilters.yearMin))
    if (initialFilters.yearMax != null) setMaxYear(String(initialFilters.yearMax))
    if (initialFilters.transmission) setSelectedTransmission(initialFilters.transmission)
  }, [initialFilters, initialSynced])

  // Cascade: khi chọn hãng → fetch dòng xe tương ứng; bỏ hãng → xóa dòng
  useEffect(() => {
    if (selectedBrand) {
      fetchSubcategories(selectedBrand as number)
      setSelectedModel('')
    } else {
      setSelectedModel('')
    }
  }, [selectedBrand, fetchSubcategories])

  const facetActive = Boolean(facets && !facets.error && !facets.isLoading)

  const brandOptions = useMemo(() => {
    if (!facets || facets.error) return categories
    if (facets.isLoading) return []
    if (facets.categoryIds.length === 0) return []
    const allow = new Set(facets.categoryIds)
    return categories.filter((c) => allow.has(c.id))
  }, [categories, facets])

  const modelOptions = useMemo(() => {
    if (!selectedBrand) return []
    if (!facetActive) return subcategories
    const allow = new Set(facets!.subcategoryIdsByCategory[selectedBrand as number] ?? [])
    if (allow.size === 0) return []
    return subcategories.filter((s) => allow.has(s.id))
  }, [subcategories, selectedBrand, facetActive, facets])

  useEffect(() => {
    if (!facetActive || !facets) return
    if (facets.categoryIds.length === 0 && selectedBrand) {
      setSelectedBrand('')
      setSelectedModel('')
      return
    }
    if (!selectedBrand) return
    if (brandOptions.length > 0 && !brandOptions.some((b) => b.id === selectedBrand)) {
      setSelectedBrand('')
      setSelectedModel('')
    }
  }, [facetActive, brandOptions, selectedBrand, facets])

  useEffect(() => {
    if (!facetActive || !selectedModel || !selectedBrand) return
    if (modelOptions.length > 0 && !modelOptions.some((m) => m.id === selectedModel)) {
      setSelectedModel('')
    }
  }, [facetActive, modelOptions, selectedModel, selectedBrand])

  const priceSliderCeil =
    facets && !facets.error && !facets.isLoading
      ? Math.max(facets.priceMax, 1_000_000)
      : 50_000_000_000

  const transmissionFilterChoices = useMemo(() => {
    const base = [...transmissionOptions]
    const cur = selectedTransmission.trim()
    if (cur && !base.includes(cur)) return [cur, ...base]
    return base
  }, [transmissionOptions, selectedTransmission])

  const parseOptInt = (s: string): number | undefined => {
    if (s === '' || s === '0') return undefined
    const n = parseInt(s, 10)
    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  const handleApply = () => {
    const params: VehicleSearchParams = {
      page: 0,
      size: 20,
      brand: selectedBrand === '' ? undefined : (selectedBrand as number),
      subcategoryId: selectedModel === '' ? undefined : (selectedModel as number),
      minPrice: parseOptInt(minPrice),
      maxPrice: parseOptInt(maxPrice),
      yearMin: parseOptInt(minYear),
      yearMax: parseOptInt(maxYear),
      transmission: selectedTransmission === '' ? undefined : selectedTransmission,
    }
    onFilterChange?.(params)
  }

  const handleClear = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setMinPrice('0')
    setMaxPrice('')
    setMinYear('')
    setMaxYear(CURRENT_YEAR)
    setSelectedTransmission('')
    onFilterChange?.({
      page: 0,
      size: 20,
      brand: undefined,
      subcategoryId: undefined,
      branchId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      yearMin: undefined,
      yearMax: undefined,
      transmission: undefined,
    })
  }

  return (
    <aside className={`w-full shrink-0 ${inline ? '' : 'lg:w-72'}`}>
      <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${inline ? '' : 'sticky top-24'}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold">Bộ lọc tìm kiếm</h3>
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-[#1A3C6E] hover:underline"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="space-y-6">
          {/* Hãng xe — từ API */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Car className="h-5 w-5 text-[#1A3C6E]" />
              Hãng xe
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              disabled={
                isLoadingCategories || (Boolean(facets) && facets!.isLoading && !facets!.error)
              }
            >
              <option value="">
                {isLoadingCategories || (facets?.isLoading && !facets.error)
                  ? 'Đang tải...'
                  : 'Tất cả hãng xe'}
              </option>
              {brandOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dòng xe — cascade từ hãng đã chọn */}
          {selectedBrand && (
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Car className="h-5 w-5 text-[#1A3C6E]" />
                Dòng xe
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              >
                <option value="">Tất cả dòng xe</option>
                {modelOptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Khoảng giá */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="h-5 w-5 text-[#1A3C6E]" />
              Khoảng giá (VNĐ)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Giá từ"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
              <input
                type="number"
                placeholder="Giá đến"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
            </div>
            {facetActive && (
              <PriceDualRange
                ceil={priceSliderCeil}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={setMinPrice}
                onMaxChange={setMaxPrice}
              />
            )}
            {facetActive && (
              <p className="mt-1 text-xs text-slate-500">
                Kéo từ 0 đến mức tối đa (theo dữ liệu xe), hoặc nhập số trực tiếp ở trên.
              </p>
            )}
          </div>

          {/* Năm sản xuất — TODO: server-side filter */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-5 w-5 text-[#1A3C6E]" />
              Năm sản xuất
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxYear}
                max={CURRENT_YEAR}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '') { setMaxYear(''); return }
                  const n = parseInt(v, 10)
                  setMaxYear(Number.isFinite(n) && n > parseInt(CURRENT_YEAR, 10) ? CURRENT_YEAR : v)
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-5 w-5 text-[#1A3C6E]" />
              Hộp số
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="gear"
                  value=""
                  checked={!selectedTransmission}
                  onChange={() => setSelectedTransmission('')}
                  className="text-[#1A3C6E] focus:ring-[#1A3C6E]"
                />
                <span className="text-sm">Tất cả</span>
              </label>
              {transmissionFilterChoices.map((label) => (
                <label key={label} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="gear"
                    value={label}
                    checked={selectedTransmission === label}
                    onChange={() => setSelectedTransmission(label)}
                    className="text-[#1A3C6E] focus:ring-[#1A3C6E]"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Button variant="primary" className="mt-8 w-full py-3 font-bold" onClick={handleApply}>
          Tìm kiếm
        </Button>
      </div>
    </aside>
  )
}
