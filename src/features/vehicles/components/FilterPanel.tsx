/**
 * FilterPanel — Bộ lọc xe dùng trong trang listing
 *
 * Fetch hãng xe từ API /catalog/categories
 * Cascade: chọn hãng → fetch dòng xe /catalog/subcategories
 * Giá: 2 input + thanh trượt kép (đồng bộ với input)
 * TODO: Nhiên liệu, hộp số → filter client-side khi backend chưa hỗ trợ
 */
import { useState, useEffect, useMemo, useRef } from 'react'
import { Car, DollarSign, Calendar, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCatalog } from '@/hooks/useCatalog'
import { useVehicleRegistryLabels } from '@/hooks/useVehicleRegistryLabels'
import { formatPriceNumber, formatPriceShort } from '@/utils/format'
import type { VehicleListingFacets } from '@/hooks/useVehicleListingFacets'
import type { VehicleSearchParams } from '@/types/vehicle.types'

interface FilterPanelProps {
  inline?: boolean
  onFilterChange?: (params: VehicleSearchParams) => void
  /** Chỉ hiển thị hãng/dòng đang có xe; biên độ giá cho slider */
  facets?: VehicleListingFacets
  /** Giá trị filter ban đầu từ URL (vd. khi tìm theo giá từ trang chủ) */
  initialFilters?: Partial<VehicleSearchParams>
  stateStorageKey?: string
}

interface FilterPanelDraft {
  selectedBrand?: number | ''
  selectedModel?: number | ''
  minPrice?: string
  maxPrice?: string
  minYear?: string
  maxYear?: string
  selectedTransmission?: string
}

const PRICE_STEP = 50_000_000
const PRICE_MAX_LIMIT = 3_000_000_000
const MIN_VEHICLE_YEAR = 1990
const CURRENT_YEAR_NUMBER = new Date().getFullYear()
const CURRENT_YEAR = CURRENT_YEAR_NUMBER.toString()

function parsePriceInput(s: string, fallback: number): number {
  const digits = s.replace(/\D/g, '')
  if (digits === '') return fallback
  const n = parseInt(digits, 10)
  return Number.isNaN(n) ? fallback : n
}

function normalizePriceInput(s: string): string {
  return s.replace(/\D/g, '')
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundPriceToStep(value: number): number {
  return Math.round(value / PRICE_STEP) * PRICE_STEP
}

function ceilPriceToStep(value: number): number {
  return Math.ceil(value / PRICE_STEP) * PRICE_STEP
}

function normalizePriceValue(value: number, ceil: number): number {
  return clampNumber(roundPriceToStep(value), 0, ceil)
}

function formatPriceInputValue(s: string): string {
  if (s === '') return ''
  return formatPriceNumber(parsePriceInput(s, 0))
}

function parseYearInput(s: string): number | undefined {
  if (s === '') return undefined
  const n = parseInt(s, 10)
  if (!Number.isFinite(n)) return undefined
  return clampNumber(n, MIN_VEHICLE_YEAR, CURRENT_YEAR_NUMBER)
}

function readFilterDraft(storageKey?: string): FilterPanelDraft | null {
  if (!storageKey || typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return null
    return JSON.parse(raw) as FilterPanelDraft
  } catch {
    return null
  }
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
  const minThumb = normalizePriceValue(parsePriceInput(minPrice, floor), ceil)
  const maxThumb = normalizePriceValue(parsePriceInput(maxPrice, ceil), ceil)

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
        step={PRICE_STEP}
        value={maxThumb}
        disabled={off}
        onChange={(e) => {
          const v = normalizePriceValue(Number(e.target.value), ceil)
          const currentMin = normalizePriceValue(parsePriceInput(minPrice, floor), ceil)
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
        step={PRICE_STEP}
        value={minThumb}
        disabled={off}
        onChange={(e) => {
          const v = normalizePriceValue(Number(e.target.value), ceil)
          const currentMax = normalizePriceValue(parsePriceInput(maxPrice, ceil), ceil)
          if (v > currentMax) onMaxChange(String(v))
          onMinChange(String(v))
        }}
        className={`${rangeClass} z-[2]`}
        aria-label="Giá tối thiểu (kéo từ 0)"
      />
    </div>
  )
}

export function FilterPanel({ inline, onFilterChange, facets, initialFilters, stateStorageKey }: FilterPanelProps) {
  const { categories, subcategories, isLoadingCategories, fetchSubcategories } = useCatalog()
  const { transmissionOptions } = useVehicleRegistryLabels()

  // Local state cho form — mặc định: Giá từ = 0, năm không giới hạn
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('')
  const [selectedModel, setSelectedModel] = useState<number | ''>('')
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [selectedTransmission, setSelectedTransmission] = useState('')
  const [initialSynced, setInitialSynced] = useState(false)
  const skipNextModelResetRef = useRef(false)

  // Đồng bộ filter ban đầu từ URL (vd. mức giá chọn ở trang chủ) vào form — chỉ chạy 1 lần
  useEffect(() => {
    if (initialSynced || !initialFilters) return
    setInitialSynced(true)
    const draft = readFilterDraft(stateStorageKey)
    const source = draft ?? {
      selectedBrand: initialFilters.brand,
      selectedModel: initialFilters.subcategoryId,
      minPrice: initialFilters.minPrice == null ? undefined : String(initialFilters.minPrice),
      maxPrice: initialFilters.maxPrice == null ? undefined : String(initialFilters.maxPrice),
      minYear: initialFilters.yearMin == null ? undefined : String(initialFilters.yearMin),
      maxYear: initialFilters.yearMax == null ? undefined : String(initialFilters.yearMax),
      selectedTransmission: initialFilters.transmission,
    }

    if (source.minPrice != null) setMinPrice(String(source.minPrice))
    if (source.maxPrice != null) setMaxPrice(String(source.maxPrice))
    if (source.selectedBrand != null) {
      skipNextModelResetRef.current = true
      setSelectedBrand(source.selectedBrand)
    }
    if (source.selectedModel != null) setSelectedModel(source.selectedModel)
    if (source.minYear != null) setMinYear(String(source.minYear))
    if (source.maxYear != null) setMaxYear(String(source.maxYear))
    if (source.selectedTransmission) setSelectedTransmission(source.selectedTransmission)
  }, [initialFilters, initialSynced, stateStorageKey])

  useEffect(() => {
    if (!stateStorageKey || !initialSynced) return
    const draft: FilterPanelDraft = {
      selectedBrand,
      selectedModel,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      selectedTransmission,
    }
    window.sessionStorage.setItem(stateStorageKey, JSON.stringify(draft))
  }, [maxPrice, maxYear, minPrice, minYear, selectedBrand, selectedModel, selectedTransmission, stateStorageKey, initialSynced])

  // Cascade: khi chọn hãng → fetch dòng xe tương ứng; bỏ hãng → xóa dòng
  useEffect(() => {
    if (selectedBrand) {
      fetchSubcategories(selectedBrand as number)
      if (skipNextModelResetRef.current) {
        skipNextModelResetRef.current = false
        return
      }
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
      ? clampNumber(ceilPriceToStep(Math.max(facets.priceMax, PRICE_STEP)), PRICE_STEP, PRICE_MAX_LIMIT)
      : PRICE_MAX_LIMIT

  const normalizedMinPrice = normalizePriceValue(parsePriceInput(minPrice, 0), priceSliderCeil)
  const normalizedMaxPrice = maxPrice === '' ? priceSliderCeil : normalizePriceValue(parsePriceInput(maxPrice, priceSliderCeil), priceSliderCeil)
  const priceRangeLabel =
    normalizedMinPrice <= 0 && maxPrice === ''
      ? `Tất cả giá đến ${formatPriceShort(priceSliderCeil)}`
      : normalizedMinPrice <= 0
        ? `Đến ${formatPriceShort(normalizedMaxPrice)}`
        : `${formatPriceShort(normalizedMinPrice)} - ${formatPriceShort(Math.max(normalizedMinPrice, normalizedMaxPrice))}`

  const isAllYears = minYear === '' && maxYear === ''

  const transmissionFilterChoices = useMemo(() => {
    const base = [...transmissionOptions]
    const cur = selectedTransmission.trim()
    if (cur && !base.includes(cur)) return [cur, ...base]
    return base
  }, [transmissionOptions, selectedTransmission])

  const handleApply = () => {
    const rawMinPrice = normalizePriceValue(parsePriceInput(minPrice, 0), priceSliderCeil)
    const rawMaxPrice = maxPrice === '' ? undefined : normalizePriceValue(parsePriceInput(maxPrice, priceSliderCeil), priceSliderCeil)
    const minPriceValue = rawMaxPrice != null && rawMinPrice > rawMaxPrice ? rawMaxPrice : rawMinPrice
    const maxPriceValue = rawMaxPrice != null && rawMinPrice > rawMaxPrice ? rawMinPrice : rawMaxPrice
    const rawMinYear = parseYearInput(minYear)
    const rawMaxYear = parseYearInput(maxYear)
    const yearMinValue = rawMinYear != null && rawMaxYear != null && rawMinYear > rawMaxYear ? rawMaxYear : rawMinYear
    const yearMaxValue = rawMinYear != null && rawMaxYear != null && rawMinYear > rawMaxYear ? rawMinYear : rawMaxYear

    setMinPrice(String(minPriceValue))
    setMaxPrice(maxPriceValue == null ? '' : String(maxPriceValue))
    setMinYear(yearMinValue == null ? '' : String(yearMinValue))
    setMaxYear(yearMaxValue == null ? '' : String(yearMaxValue))

    const params: VehicleSearchParams = {
      page: 0,
      size: 20,
      brand: selectedBrand === '' ? undefined : (selectedBrand as number),
      subcategoryId: selectedModel === '' ? undefined : (selectedModel as number),
      minPrice: minPriceValue > 0 ? minPriceValue : undefined,
      maxPrice: maxPriceValue != null && maxPriceValue > 0 ? maxPriceValue : undefined,
      yearMin: yearMinValue,
      yearMax: yearMaxValue,
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
    setMaxYear('')
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
            <div className="mb-3 rounded-lg bg-[#1A3C6E]/5 px-3 py-2 text-sm font-semibold text-[#1A3C6E]">
              Khoảng giá: {priceRangeLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Giá từ"
                value={formatPriceInputValue(minPrice)}
                onChange={(e) => setMinPrice(normalizePriceInput(e.target.value))}
                onBlur={() => setMinPrice(String(normalizePriceValue(parsePriceInput(minPrice, 0), priceSliderCeil)))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                aria-label="Giá từ"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Giá đến"
                value={formatPriceInputValue(maxPrice)}
                onChange={(e) => setMaxPrice(normalizePriceInput(e.target.value))}
                onBlur={() => {
                  if (maxPrice === '') return
                  setMaxPrice(String(normalizePriceValue(parsePriceInput(maxPrice, priceSliderCeil), priceSliderCeil)))
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                aria-label="Giá đến"
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
                Bước giá {formatPriceShort(PRICE_STEP)}. Tối đa {formatPriceShort(priceSliderCeil)} theo dữ liệu xe.
              </p>
            )}
          </div>

          {/* Năm sản xuất — TODO: server-side filter */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-5 w-5 text-[#1A3C6E]" />
              Năm sản xuất
            </label>
            <label className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isAllYears}
                onChange={(e) => {
                  if (e.target.checked) {
                    setMinYear('')
                    setMaxYear('')
                  } else {
                    setMinYear(String(MIN_VEHICLE_YEAR))
                    setMaxYear(CURRENT_YEAR)
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
              />
              Mọi năm
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minYear}
                min={MIN_VEHICLE_YEAR}
                max={CURRENT_YEAR}
                step={1}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '') { setMinYear(''); return }
                  const n = parseInt(v, 10)
                  setMinYear(Number.isFinite(n) ? String(clampNumber(n, MIN_VEHICLE_YEAR, CURRENT_YEAR_NUMBER)) : '')
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                aria-label="Năm sản xuất từ"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxYear}
                min={MIN_VEHICLE_YEAR}
                max={CURRENT_YEAR}
                step={1}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '') { setMaxYear(''); return }
                  const n = parseInt(v, 10)
                  setMaxYear(Number.isFinite(n) ? String(clampNumber(n, MIN_VEHICLE_YEAR, CURRENT_YEAR_NUMBER)) : '')
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                aria-label="Năm sản xuất đến"
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
