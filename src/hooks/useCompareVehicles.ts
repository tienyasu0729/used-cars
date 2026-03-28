/**
 * useCompareVehicles — Hook quản lý so sánh xe (max 3)
 *
 * Kết hợp compareStore (Zustand) + API /vehicles/compare
 * Persist compareList vào sessionStorage
 */
import { useState, useEffect, useCallback } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useToastStore } from '@/store/toastStore'
import type { Vehicle } from '@/types/vehicle.types'

const SESSION_KEY = 'compare_vehicle_ids'

interface UseCompareVehiclesReturn {
  compareList: number[]
  addToCompare: (id: number) => void
  removeFromCompare: (id: number) => void
  clearCompare: () => void
  fetchComparison: () => Promise<void>
  comparedData: Vehicle[]
  isLoading: boolean
}

export function useCompareVehicles(): UseCompareVehiclesReturn {
  const toast = useToastStore()
  const [compareList, setCompareList] = useState<number[]>(() => {
    // Khôi phục từ sessionStorage
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [comparedData, setComparedData] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Persist vào sessionStorage khi compareList thay đổi
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(compareList))
  }, [compareList])

  const addToCompare = useCallback(
    (id: number) => {
      setCompareList((prev) => {
        if (prev.includes(id)) return prev
        if (prev.length >= 3) {
          toast.addToast('warning', 'Chỉ so sánh tối đa 3 xe')
          return prev
        }
        toast.addToast('success', `Đã thêm vào so sánh (${prev.length + 1}/3)`)
        return [...prev, id]
      })
    },
    [toast]
  )

  const removeFromCompare = useCallback((id: number) => {
    setCompareList((prev) => prev.filter((v) => v !== id))
  }, [])

  const clearCompare = useCallback(() => {
    setCompareList([])
    setComparedData([])
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  // Gọi API so sánh khi đủ >= 2 xe
  const fetchComparison = useCallback(async () => {
    if (compareList.length < 2) {
      toast.addToast('warning', 'Cần chọn ít nhất 2 xe để so sánh')
      return
    }

    setIsLoading(true)
    try {
      const vehicles = await vehicleService.compareVehicles(compareList)
      setComparedData(vehicles)
    } catch (err: unknown) {
      console.error('[useCompareVehicles] Lỗi so sánh:', err)
      toast.addToast('error', 'Lỗi tải dữ liệu so sánh')
    } finally {
      setIsLoading(false)
    }
  }, [compareList, toast])

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    fetchComparison,
    comparedData,
    isLoading,
  }
}
