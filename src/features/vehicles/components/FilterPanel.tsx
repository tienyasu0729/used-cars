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
import type { VehicleListingFacets } from '@/hooks/useVehicleListingFacets'
import type { VehicleSearchParams } from '@/types/vehicle.types'

interface FilterPanelProps {
  inline?: boolean
  onFilterChange?: (params: VehicleSearchParams) => void
  /** Chỉ hiển thị hãng/dòng đang có xe; biên độ giá cho slider */
  facets?: VehicleListingFacets
}

function parsePriceInput(s: string, fallback: number): number {
  if (s === '') return fallback
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? fallback : n
}

function PriceDualRange({
  floor,
  ceil,
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  disabled,
}: {
  floor: number
  ceil: number
  minPrice: string
  maxPrice: string
  onMinChange: (v: string) => void
  onMaxChange: (v: string) => void
  disabled?: boolean
}) {
  const step = Math.max(1_000_000, Math.round((ceil - floor) / 150) || 1_000_000)
  const minThumb = Math.min(Math.max(parsePriceInput(minPrice, floor), floor), ceil)
  const maxThumb = Math.min(Math.max(parsePriceInput(maxPrice, ceil), floor), ceil)

  const rangeClass =
    'pointer-events-none absolute h-2 w-full cursor-pointer appearance-none bg-transparent disabled:opacity-40 ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 ' +
    '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#1A3C6E] ' +
    '[&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 ' +
    '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full ' +
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#1A3C6E]'

  return (
    <div className="relative mt-3 h-8">
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200"
        aria-hidden
      />
      <input
        type="range"
        min={floor}
        max={ceil}
        step={step}
        value={minThumb}
        disabled={disabled || ceil <= floor}
        onChange={(e) => {
          const v = Number(e.target.value)
          const currentMax = parsePriceInput(maxPrice, ceil)
          if (v > currentMax) onMaxChange(String(v))
          onMinChange(String(v))
        }}
        className={`${rangeClass} z-20`}
        aria-label="Giá tối thiểu (kéo)"
      />
      <input
        type="range"
        min={floor}
        max={ceil}
        step={step}
        value={maxThumb}
        disabled={disabled || ceil <= floor}
        onChange={(e) => {
          const v = Number(e.target.value)
          const currentMin = parsePriceInput(minPrice, floor)
          if (v < currentMin) onMinChange(String(v))
          onMaxChange(String(v))
        }}
        className={`${rangeClass} z-30`}
        aria-label="Giá tối đa (kéo)"
      />
    </div>
  )
}

export function FilterPanel({ inline, onFilterChange, facets }: FilterPanelProps) {
  const { categories, subcategories, isLoadingCategories, fetchSubcategories } = useCatalog()

  // Local state cho form
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('')
  const [selectedModel, setSelectedModel] = useState<number | ''>('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  // TODO: chuyển sang server-side filter khi backend support
  const [selectedFuel, setSelectedFuel] = useState('')
  const [selectedTransmission, setSelectedTransmission] = useState('')

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

  const priceFloor = facets && !facets.error ? facets.priceMin : 0
  const priceCeil = facets && !facets.error ? facets.priceMax : 1

  // Submit filter
  const handleApply = () => {
    const params: VehicleSearchParams = {
      page: 0,
      size: 20,
    }
    if (selectedBrand) params.brand = selectedBrand as number
    if (minPrice) params.minPrice = parseInt(minPrice, 10)
    if (maxPrice) params.maxPrice = parseInt(maxPrice, 10)

    onFilterChange?.(params)
  }

  // Xóa tất cả filter
  const handleClear = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedFuel('')
    setSelectedTransmission('')
    onFilterChange?.({ page: 0, size: 20 })
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
            {facets && !facets.error && !facets.isLoading && facets.categoryIds.length > 0 && (
              <PriceDualRange
                floor={priceFloor}
                ceil={priceCeil}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={setMinPrice}
                onMaxChange={setMaxPrice}
              />
            )}
            {facets && !facets.error && !facets.isLoading && facets.categoryIds.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Kéo hai nút để chọn khoảng giá, hoặc nhập số trực tiếp ở trên.
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
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
              <input
                type="number"
                placeholder="Đến"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
            </div>
          </div>

          {/* Hộp số — TODO: chuyển sang server-side filter khi backend support */}
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
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="gear"
                  value="Số tự động"
                  checked={selectedTransmission === 'Số tự động'}
                  onChange={() => setSelectedTransmission('Số tự động')}
                  className="text-[#1A3C6E] focus:ring-[#1A3C6E]"
                />
                <span className="text-sm">Số tự động (AT)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="gear"
                  value="Số sàn"
                  checked={selectedTransmission === 'Số sàn'}
                  onChange={() => setSelectedTransmission('Số sàn')}
                  className="text-[#1A3C6E] focus:ring-[#1A3C6E]"
                />
                <span className="text-sm">Số sàn (MT)</span>
              </label>
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
