import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, Car, DollarSign, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui'
import { useCatalog } from '@/hooks/useCatalog'
import type { VehicleListingFacets } from '@/hooks/useVehicleListingFacets'
import { useVehicleRegistryLabels } from '@/hooks/useVehicleRegistryLabels'
import type { VehicleSearchParams } from '@/types/vehicle.types'
import { formatPriceNumber, formatPriceShort } from '@/utils/format'

interface FilterPanelProps {
  inline?: boolean
  onFilterChange?: (params: VehicleSearchParams) => void
  facets?: VehicleListingFacets
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
const CURRENT_YEAR = String(CURRENT_YEAR_NUMBER)

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function parsePriceInput(value: string, fallback: number): number {
  const digits = value.replace(/\D/g, '')
  if (!digits) return fallback
  const parsed = Number.parseInt(digits, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizePriceInput(value: string): string {
  return value.replace(/\D/g, '')
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

function formatPriceInputValue(value: string): string {
  if (!value) return ''
  return formatPriceNumber(parsePriceInput(value, 0))
}

function parseYearInput(value: string): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return clampNumber(parsed, MIN_VEHICLE_YEAR, CURRENT_YEAR_NUMBER)
}

function readFilterDraft(storageKey?: string): FilterPanelDraft | null {
  if (!storageKey || typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as FilterPanelDraft) : null
  } catch {
    return null
  }
}

function clearFilterDraft(storageKey?: string) {
  if (!storageKey || typeof window === 'undefined') return
  window.sessionStorage.removeItem(storageKey)
}

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
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  disabled?: boolean
}) {
  const floor = 0
  const minThumb = normalizePriceValue(parsePriceInput(minPrice, floor), ceil)
  const maxThumb = normalizePriceValue(parsePriceInput(maxPrice, ceil), ceil)
  const sharedClass =
    'absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-40 ' +
    '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent ' +
    '[&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab ' +
    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white ' +
    '[&::-webkit-slider-thumb]:bg-[#1A3C6E] [&::-webkit-slider-thumb]:shadow-md ' +
    '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent ' +
    '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab ' +
    '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white ' +
    '[&::-moz-range-thumb]:bg-[#1A3C6E]'
  const off = disabled || ceil <= 0

  return (
    <div className="relative mt-3 h-10">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" aria-hidden />
      <input
        type="range"
        min={floor}
        max={ceil}
        step={PRICE_STEP}
        value={maxThumb}
        disabled={off}
        onChange={(event) => {
          const next = normalizePriceValue(Number(event.target.value), ceil)
          const currentMin = normalizePriceValue(parsePriceInput(minPrice, floor), ceil)
          if (next < currentMin) onMinChange(String(next))
          onMaxChange(String(next))
        }}
        className={`${sharedClass} z-[1]`}
        aria-label="Gia toi da"
      />
      <input
        type="range"
        min={floor}
        max={ceil}
        step={PRICE_STEP}
        value={minThumb}
        disabled={off}
        onChange={(event) => {
          const next = normalizePriceValue(Number(event.target.value), ceil)
          const currentMax = normalizePriceValue(parsePriceInput(maxPrice, ceil), ceil)
          if (next > currentMax) onMaxChange(String(next))
          onMinChange(String(next))
        }}
        className={`${sharedClass} z-[2]`}
        aria-label="Gia toi thieu"
      />
    </div>
  )
}

export function FilterPanel({
  inline,
  onFilterChange,
  facets,
  initialFilters,
  stateStorageKey,
}: FilterPanelProps) {
  const { categories, subcategories, isLoadingCategories, fetchSubcategories } = useCatalog()
  const { transmissionOptions } = useVehicleRegistryLabels()

  const [selectedBrand, setSelectedBrand] = useState<number | ''>('')
  const [selectedModel, setSelectedModel] = useState<number | ''>('')
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [selectedTransmission, setSelectedTransmission] = useState('')
  const [initialSynced, setInitialSynced] = useState(false)
  const skipNextModelResetRef = useRef(false)

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
  }, [initialSynced, maxPrice, maxYear, minPrice, minYear, selectedBrand, selectedModel, selectedTransmission, stateStorageKey])

  useEffect(() => {
    if (selectedBrand) {
      void fetchSubcategories(selectedBrand)
      if (skipNextModelResetRef.current) {
        skipNextModelResetRef.current = false
        return
      }
      setSelectedModel('')
      return
    }
    setSelectedModel('')
  }, [fetchSubcategories, selectedBrand])

  const facetActive = Boolean(facets && !facets.error && !facets.isLoading)
  const facetPriceMax = facets?.priceMax ?? 0
  const hasFacetPriceRange = facetActive && Number.isFinite(facetPriceMax) && facetPriceMax > 0

  const brandOptions = useMemo(() => {
    if (!facets || facets.error) return categories
    if (facets.isLoading) return []
    if (facets.categoryIds.length === 0) return []
    const allowed = new Set(facets.categoryIds)
    return categories.filter((category) => allowed.has(category.id))
  }, [categories, facets])

  const modelOptions = useMemo(() => {
    if (!selectedBrand) return []
    if (!facetActive) return subcategories
    const allowed = new Set(facets?.subcategoryIdsByCategory[selectedBrand] ?? [])
    return subcategories.filter((sub) => allowed.has(sub.id))
  }, [facetActive, facets, selectedBrand, subcategories])

  useEffect(() => {
    if (!facetActive || !selectedBrand) return
    if (!brandOptions.some((brand) => brand.id === selectedBrand)) {
      setSelectedBrand('')
      setSelectedModel('')
    }
  }, [brandOptions, facetActive, selectedBrand])

  useEffect(() => {
    if (!facetActive || !selectedModel || !selectedBrand) return
    if (!modelOptions.some((model) => model.id === selectedModel)) {
      setSelectedModel('')
    }
  }, [facetActive, modelOptions, selectedBrand, selectedModel])

  const priceSliderCeil = hasFacetPriceRange
    ? clampNumber(ceilPriceToStep(Math.max(facets!.priceMax, PRICE_STEP)), PRICE_STEP, PRICE_MAX_LIMIT)
    : PRICE_MAX_LIMIT

  const normalizedMinPrice = normalizePriceValue(parsePriceInput(minPrice, 0), priceSliderCeil)
  const normalizedMaxPrice = maxPrice === '' ? priceSliderCeil : normalizePriceValue(parsePriceInput(maxPrice, priceSliderCeil), priceSliderCeil)
  const isAllYears = minYear === '' && maxYear === ''
  const transmissionChoices = useMemo(() => {
    const current = selectedTransmission.trim()
    return current && !transmissionOptions.includes(current) ? [current, ...transmissionOptions] : [...transmissionOptions]
  }, [selectedTransmission, transmissionOptions])

  const priceRangeLabel =
    normalizedMinPrice <= 0 && maxPrice === ''
      ? `Tat ca gia den ${formatPriceShort(priceSliderCeil)}`
      : normalizedMinPrice <= 0
        ? `Den ${formatPriceShort(normalizedMaxPrice)}`
        : `${formatPriceShort(normalizedMinPrice)} - ${formatPriceShort(Math.max(normalizedMinPrice, normalizedMaxPrice))}`

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

    onFilterChange?.({
      page: 0,
      size: 20,
      brand: selectedBrand === '' ? undefined : selectedBrand,
      subcategoryId: selectedModel === '' ? undefined : selectedModel,
      minPrice: minPriceValue > 0 ? minPriceValue : undefined,
      maxPrice: maxPriceValue != null && maxPriceValue > 0 ? maxPriceValue : undefined,
      yearMin: yearMinValue,
      yearMax: yearMaxValue,
      transmission: selectedTransmission || undefined,
    })
  }

  const handleClear = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setMinPrice('0')
    setMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setSelectedTransmission('')
    clearFilterDraft(stateStorageKey)
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
          <h3 className="text-lg font-bold">Bo loc tim kiem</h3>
          <button onClick={handleClear} className="text-xs font-semibold text-[#1A3C6E] hover:underline">
            Xoa tat ca
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Car className="h-5 w-5 text-[#1A3C6E]" />
              Hang xe
            </label>
            <select
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value ? Number(event.target.value) : '')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              disabled={isLoadingCategories || Boolean(facets?.isLoading && !facets.error)}
            >
              <option value="">
                {isLoadingCategories || (facets?.isLoading && !facets.error) ? 'Dang tai...' : 'Tat ca hang xe'}
              </option>
              {brandOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBrand && (
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Car className="h-5 w-5 text-[#1A3C6E]" />
                Dong xe
              </label>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value ? Number(event.target.value) : '')}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              >
                <option value="">Tat ca dong xe</option>
                {modelOptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="h-5 w-5 text-[#1A3C6E]" />
              Khoang gia (VND)
            </label>
            <div className="mb-3 rounded-lg bg-[#1A3C6E]/5 px-3 py-2 text-sm font-semibold text-[#1A3C6E]">
              Khoang gia: {priceRangeLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Gia tu"
                value={formatPriceInputValue(minPrice)}
                onChange={(event) => setMinPrice(normalizePriceInput(event.target.value))}
                onBlur={() => setMinPrice(String(normalizePriceValue(parsePriceInput(minPrice, 0), priceSliderCeil)))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Gia den"
                value={formatPriceInputValue(maxPrice)}
                onChange={(event) => setMaxPrice(normalizePriceInput(event.target.value))}
                onBlur={() => {
                  if (!maxPrice) return
                  setMaxPrice(String(normalizePriceValue(parsePriceInput(maxPrice, priceSliderCeil), priceSliderCeil)))
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
            </div>
            <PriceDualRange
              ceil={priceSliderCeil}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
              disabled={!hasFacetPriceRange}
            />
            <p className="mt-1 text-xs text-slate-500">
              {hasFacetPriceRange
                ? `Buoc gia ${formatPriceShort(PRICE_STEP)}. Toi da ${formatPriceShort(priceSliderCeil)} theo du lieu xe.`
                : 'Chua du bien gia tu du lieu xe. Dang dung muc mac dinh de ban nhap va loc doc lap.'}
            </p>
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-5 w-5 text-[#1A3C6E]" />
              Nam san xuat
            </label>
            <label className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isAllYears}
                onChange={(event) => {
                  if (event.target.checked) {
                    setMinYear('')
                    setMaxYear('')
                  } else {
                    setMinYear(String(MIN_VEHICLE_YEAR))
                    setMaxYear(CURRENT_YEAR)
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
              />
              Moi nam
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Tu"
                value={minYear}
                min={MIN_VEHICLE_YEAR}
                max={CURRENT_YEAR}
                step={1}
                onChange={(event) => {
                  const value = event.target.value
                  if (!value) {
                    setMinYear('')
                    return
                  }
                  const parsed = Number.parseInt(value, 10)
                  setMinYear(Number.isFinite(parsed) ? String(clampNumber(parsed, MIN_VEHICLE_YEAR, CURRENT_YEAR_NUMBER)) : '')
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
              <input
                type="number"
                placeholder="Den"
                value={maxYear}
                min={MIN_VEHICLE_YEAR}
                max={CURRENT_YEAR}
                step={1}
                onChange={(event) => {
                  const value = event.target.value
                  if (!value) {
                    setMaxYear('')
                    return
                  }
                  const parsed = Number.parseInt(value, 10)
                  setMaxYear(Number.isFinite(parsed) ? String(clampNumber(parsed, MIN_VEHICLE_YEAR, CURRENT_YEAR_NUMBER)) : '')
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-5 w-5 text-[#1A3C6E]" />
              Hop so
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
                Tat ca
              </label>
              {transmissionChoices.map((choice) => (
                <label key={choice} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="gear"
                    value={choice}
                    checked={selectedTransmission === choice}
                    onChange={() => setSelectedTransmission(choice)}
                    className="text-[#1A3C6E] focus:ring-[#1A3C6E]"
                  />
                  {choice}
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleApply}>
            Tim kiem
          </Button>
        </div>
      </div>
    </aside>
  )
}
