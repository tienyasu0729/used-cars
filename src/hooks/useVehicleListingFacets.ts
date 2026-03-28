/**
 * Gom hãng / dòng xe / biên độ giá từ toàn bộ xe public (phân trang size=100)
 * để chỉ hiển thị trong bộ lọc những giá trị thực sự có listing.
 */
import { useState, useEffect, useMemo } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import type { Vehicle } from '@/types/vehicle.types'

export interface VehicleListingFacets {
  categoryIds: number[]
  /** Mỗi hãng → các subcategory id đang có xe */
  subcategoryIdsByCategory: Record<number, number[]>
  priceMin: number
  priceMax: number
  isLoading: boolean
  error: string | null
}

function readVehicleFields(v: Vehicle) {
  const r = v as Vehicle & Record<string, unknown>
  const cat = r.category_id ?? r.categoryId
  const sub = r.subcategory_id ?? r.subcategoryId
  const price = r.price
  const categoryId = typeof cat === 'number' ? cat : Number(cat)
  const subcategoryId = typeof sub === 'number' ? sub : Number(sub)
  const p =
    typeof price === 'number'
      ? price
      : price != null
        ? Number(price)
        : NaN
  return {
    categoryId: Number.isFinite(categoryId) ? categoryId : NaN,
    subcategoryId: Number.isFinite(subcategoryId) ? subcategoryId : NaN,
    price: Number.isFinite(p) ? p : NaN,
  }
}

export function useVehicleListingFacets(): VehicleListingFacets {
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [subcategoryIdsByCategory, setSubcategoryIdsByCategory] = useState<
    Record<number, number[]>
  >({})
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      const catSet = new Set<number>()
      const subMap = new Map<number, Set<number>>()
      let pMin = Infinity
      let pMax = -Infinity

      try {
        const size = 100
        let page = 0
        let totalPages = 1

        while (page < totalPages) {
          const res = await vehicleService.getVehicles({ page, size })
          if (cancelled) return

          totalPages = Math.max(1, res.meta.totalPages)

          for (const v of res.items) {
            const { categoryId, subcategoryId, price } = readVehicleFields(v)
            if (!Number.isNaN(categoryId)) {
              catSet.add(categoryId)
              if (!Number.isNaN(subcategoryId)) {
                if (!subMap.has(categoryId)) subMap.set(categoryId, new Set())
                subMap.get(categoryId)!.add(subcategoryId)
              }
            }
            if (!Number.isNaN(price)) {
              pMin = Math.min(pMin, price)
              pMax = Math.max(pMax, price)
            }
          }

          page += 1
        }

        if (cancelled) return

        if (pMin === Infinity) {
          pMin = 0
          pMax = 1
        } else if (pMax <= pMin) {
          pMax = pMin + 10_000_000
        }

        const subRecord: Record<number, number[]> = {}
        subMap.forEach((set, cid) => {
          subRecord[cid] = [...set].sort((a, b) => a - b)
        })

        setCategoryIds([...catSet].sort((a, b) => a - b))
        setSubcategoryIdsByCategory(subRecord)
        setPriceMin(pMin)
        setPriceMax(pMax)
      } catch (e: unknown) {
        if (!cancelled) {
          const msg =
            (e as { message?: string })?.message ?? 'Không tải được dữ liệu lọc'
          setError(msg)
          setCategoryIds([])
          setSubcategoryIdsByCategory({})
          setPriceMin(0)
          setPriceMax(1)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(
    () => ({
      categoryIds,
      subcategoryIdsByCategory,
      priceMin,
      priceMax,
      isLoading,
      error,
    }),
    [categoryIds, subcategoryIdsByCategory, priceMin, priceMax, isLoading, error]
  )
}
