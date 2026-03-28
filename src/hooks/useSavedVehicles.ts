/**
 * useSavedVehicles — Hook xe đã lưu yêu thích (Customer)
 *
 * Fetch từ API GET /users/me/saved-vehicles
 * Hỗ trợ removeVehicle với optimistic update
 * Chỉ gọi khi user đã đăng nhập
 */
import { useState, useEffect, useCallback } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useAuthStore } from '@/store/authStore'
import type { Vehicle } from '@/types/vehicle.types'

interface UseSavedVehiclesReturn {
  savedVehicles: Vehicle[]
  isLoading: boolean
  error: string | null
  removeVehicle: (id: number) => Promise<void>
  refetch: () => void
}

export function useSavedVehicles(): UseSavedVehiclesReturn {
  const { isAuthenticated } = useAuthStore()
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedVehicles([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const vehicles = await vehicleService.getSavedVehicles()
      setSavedVehicles(vehicles)
    } catch (err: unknown) {
      setError('Lỗi tải danh sách xe yêu thích')
      console.error('[useSavedVehicles] Lỗi:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  // Optimistic update: xóa khỏi list trước, nếu API fail thì rollback
  const removeVehicle = useCallback(
    async (vehicleId: number) => {
      const backup = [...savedVehicles]
      // Xóa khỏi list ngay lập tức (optimistic)
      setSavedVehicles((prev) => prev.filter((v) => v.id !== vehicleId))

      try {
        await vehicleService.unsaveVehicle(vehicleId)
      } catch (err: unknown) {
        // Rollback nếu API fail
        setSavedVehicles(backup)
        console.error('[useSavedVehicles] Lỗi xóa:', err)
      }
    },
    [savedVehicles]
  )

  return {
    savedVehicles,
    isLoading,
    error,
    removeVehicle,
    refetch: fetchSaved,
  }
}
