/**
 * useCatalog — Hook lấy danh sách hãng xe + dòng xe từ API
 *
 * Fetch categories từ GET /catalog/categories
 * Fetch subcategories cascade khi chọn hãng
 * Các chức năng ngoài Dev 2 (colors, fuelTypes...) giữ mock nếu cần
 */
import { useState, useEffect, useCallback } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import type { Category, Subcategory } from '@/types/vehicle.types'

interface UseCatalogReturn {
  categories: Category[]
  subcategories: Subcategory[]
  isLoadingCategories: boolean
  isLoadingSubcategories: boolean
  fetchSubcategories: (categoryId: number) => Promise<void>
}

export function useCatalog(): UseCatalogReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false)

  // Fetch danh sách hãng xe khi mount
  useEffect(() => {
    setIsLoadingCategories(true)
    vehicleService
      .getCategories()
      .then(setCategories)
      .catch((err) => {
        console.error('[useCatalog] Lỗi tải hãng xe:', err)
      })
      .finally(() => setIsLoadingCategories(false))
  }, [])

  // Fetch dòng xe theo hãng đã chọn
  const fetchSubcategories = useCallback(async (categoryId: number) => {
    setIsLoadingSubcategories(true)
    setSubcategories([]) // Reset khi đổi hãng
    try {
      const subs = await vehicleService.getSubcategories(categoryId)
      setSubcategories(subs)
    } catch (err) {
      console.error('[useCatalog] Lỗi tải dòng xe:', err)
    } finally {
      setIsLoadingSubcategories(false)
    }
  }, [])

  return {
    categories,
    subcategories,
    isLoadingCategories,
    isLoadingSubcategories,
    fetchSubcategories,
  }
}
