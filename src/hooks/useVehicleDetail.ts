/**
 * useVehicleDetail — Hook chi tiết xe + toggle yêu thích
 *
 * Trả về vehicle data, trạng thái saved, và hàm toggleSave
 * Nếu chưa đăng nhập và bấm save → redirect /login
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehicleService } from '@/services/vehicle.service'
import { interactionService } from '@/services/interaction.service'
import { useAuthStore } from '@/store/authStore'
import type { Vehicle } from '@/types/vehicle.types'
import { INVENTORY_CHANGED_EVENT } from '@/utils/inventorySync'
import { canUseManagedVehicleView } from '@/utils/userRole'

interface UseVehicleDetailReturn {
  vehicle: Vehicle | null
  isLoading: boolean
  error: string | null
  isSaved: boolean
  toggleSave: () => Promise<void>
  refetchVehicle: () => void
}

interface UseVehicleDetailOptions {
  preferManaged?: boolean
}

export function useVehicleDetail(vehicleId: number | undefined, options?: UseVehicleDetailOptions): UseVehicleDetailReturn {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const refetchVehicle = useCallback(() => {
    if (!vehicleId || isNaN(vehicleId)) {
      setIsLoading(false)
      setError('ID xe không hợp lệ')
      return
    }
    setIsLoading(true)
    setError(null)
    const canUseManagedDetail = Boolean(options?.preferManaged && isAuthenticated && canUseManagedVehicleView(user?.role))
    const getDetail = canUseManagedDetail
      ? vehicleService.getManagerVehicleById(vehicleId)
      : vehicleService.getVehicleById(vehicleId)
    getDetail
      .then((v) => {
        setVehicle(v)
        if (!canUseManagedDetail) {
          interactionService.recordView(vehicleId)
        }
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
  }, [vehicleId, options?.preferManaged, isAuthenticated, user?.role])

  useEffect(() => {
    refetchVehicle()
  }, [refetchVehicle])

  useEffect(() => {
    const onInv = () => refetchVehicle()
    window.addEventListener(INVENTORY_CHANGED_EVENT, onInv)
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, onInv)
  }, [refetchVehicle])

  // Kiểm tra xe đã lưu chưa (chỉ khi đã đăng nhập)
  useEffect(() => {
    if (!isAuthenticated || !vehicleId) return

    interactionService
      .getSavedVehicles()
      .then((saved) => {
        const found = saved.some((s) => s.vehicleId === vehicleId)
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
        await interactionService.unsaveVehicle(vehicleId)
        setIsSaved(false)
      } else {
        await interactionService.saveVehicle(vehicleId)
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

  return { vehicle, isLoading, error, isSaved, toggleSave, refetchVehicle }
}
