/**
 * useVehicleDetail — Hook chi tiết xe + toggle yêu thích
 *
 * Trả về vehicle data, trạng thái saved, và hàm toggleSave
 * Nếu chưa đăng nhập và bấm save → redirect /login
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehicleService } from '@/services/vehicle.service'
import { useAuthStore } from '@/store/authStore'
import type { Vehicle } from '@/types/vehicle.types'

interface UseVehicleDetailReturn {
  vehicle: Vehicle | null
  isLoading: boolean
  error: string | null
  isSaved: boolean
  toggleSave: () => Promise<void>
}

export function useVehicleDetail(vehicleId: number | undefined): UseVehicleDetailReturn {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Fetch chi tiết xe
  useEffect(() => {
    if (!vehicleId || isNaN(vehicleId)) {
      setIsLoading(false)
      setError('ID xe không hợp lệ')
      return
    }

    setIsLoading(true)
    setError(null)

    vehicleService
      .getVehicleById(vehicleId)
      .then((v) => {
        setVehicle(v)
      })
      .catch((err) => {
        const code = err?.errorCode
        if (code === 'VEHICLE_NOT_FOUND') {
          setError('Xe không tồn tại hoặc đã bị xóa')
        } else {
          setError('Lỗi tải thông tin xe')
        }
        console.error('[useVehicleDetail] Lỗi:', err)
      })
      .finally(() => setIsLoading(false))
  }, [vehicleId])

  // Kiểm tra xe đã lưu chưa (chỉ khi đã đăng nhập)
  useEffect(() => {
    if (!isAuthenticated || !vehicleId) return

    vehicleService
      .getSavedVehicles()
      .then((saved) => {
        const found = saved.some((v) => v.id === vehicleId)
        setIsSaved(found)
      })
      .catch(() => {
        // Không throw lỗi, mặc định chưa lưu
        setIsSaved(false)
      })
  }, [isAuthenticated, vehicleId])

  // Toggle lưu/bỏ lưu xe
  const toggleSave = useCallback(async () => {
    if (!vehicleId) return

    // Chưa đăng nhập → redirect login
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      if (isSaved) {
        await vehicleService.unsaveVehicle(vehicleId)
        setIsSaved(false)
      } else {
        await vehicleService.saveVehicle(vehicleId)
        setIsSaved(true)
      }
    } catch (err: unknown) {
      const code = (err as { errorCode?: string })?.errorCode
      // Handle gracefully — không phải lỗi hệ thống
      if (code === 'VEHICLE_ALREADY_SAVED') {
        setIsSaved(true)
      } else if (code === 'VEHICLE_NOT_SAVED') {
        setIsSaved(false)
      } else {
        console.warn('[useVehicleDetail] toggleSave lỗi:', err)
      }
    }
  }, [vehicleId, isSaved, isAuthenticated, navigate])

  return { vehicle, isLoading, error, isSaved, toggleSave }
}
