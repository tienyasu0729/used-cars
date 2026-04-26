import { useState, useCallback } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useToastStore } from '@/store/toastStore'
import { useCompareStore } from '@/store/compareStore'
import type { Vehicle } from '@/types/vehicle.types'

interface UseCompareVehiclesReturn {
  compareList: number[]
  addToCompare: (vehicle: Pick<Vehicle, 'id' | 'title'>) => void
  removeFromCompare: (id: number) => void
  clearCompare: () => void
  fetchComparison: () => Promise<void>
  comparedData: Vehicle[]
  isLoading: boolean
}

export function useCompareVehicles(): UseCompareVehiclesReturn {
  const addToast = useToastStore((s) => s.addToast)
  const entries = useCompareStore((s) => s.entries)
  const addEntry = useCompareStore((s) => s.addEntry)
  const removeEntry = useCompareStore((s) => s.removeEntry)
  const clear = useCompareStore((s) => s.clear)

  const compareList = entries.map((e) => e.id)
  const [comparedData, setComparedData] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addToCompare = useCallback(
    (vehicle: Pick<Vehicle, 'id' | 'title'>) => {
      const r = addEntry({ id: vehicle.id, title: vehicle.title })
      if (r === 'full') {
        addToast('warning', 'Chỉ so sánh tối đa 3 xe')
        return
      }
      if (r === 'added') {
        const n = useCompareStore.getState().entries.length
        addToast('success', `Đã thêm vào so sánh (${n}/3)`)
      }
    },
    [addEntry, addToast]
  )

  const removeFromCompare = useCallback(
    (id: number) => {
      removeEntry(id)
    },
    [removeEntry]
  )

  const clearCompare = useCallback(() => {
    clear()
    setComparedData([])
  }, [clear])

  const fetchComparison = useCallback(async () => {
    const ids = useCompareStore.getState().entries.map((e) => e.id)
    if (ids.length < 2) {
      addToast('warning', 'Cần chọn ít nhất 2 xe để so sánh')
      return
    }

    setIsLoading(true)
    try {
      const vehicles = await vehicleService.compareVehicles(ids)
      setComparedData(vehicles)
    } catch (err: unknown) {
      console.error('[useCompareVehicles] Lỗi so sánh:', err)
      addToast('error', 'Lỗi tải dữ liệu so sánh')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

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
