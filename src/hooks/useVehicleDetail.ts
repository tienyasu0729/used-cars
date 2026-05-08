/**
 * useVehicleDetail — Hook chi tiết xe + toggle yêu thích
 *
 * Route token public có thể là id nội bộ hoặc listingId legacy.
 * Các thao tác nghiệp vụ vẫn phải dùng vehicle.id thật sau khi tải detail thành công.
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

export function useVehicleDetail(
  vehicleToken: string | undefined,
  options?: UseVehicleDetailOptions
): UseVehicleDetailReturn {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const currentVehicleId = vehicle?.id

  const refetchVehicle = useCallback(() => {
    const normalizedToken = vehicleToken?.trim()
    if (!normalizedToken) {
      setVehicle(null)
      setIsLoading(false)
      setError('ID xe không hợp lệ')
      return
    }

    setIsLoading(true)
    setError(null)

    const canUseManagedDetail = Boolean(
      options?.preferManaged && isAuthenticated && canUseManagedVehicleView(user?.role)
    )

    const getDetail = canUseManagedDetail
      ? vehicleService.getManagerVehicleById(Number(normalizedToken))
      : vehicleService.getVehicleById(normalizedToken)

    getDetail
      .then((v) => {
        setVehicle(v)
        if (!canUseManagedDetail) {
          interactionService.recordView(v.id)
        }
      })
      .catch((err) => {
        setVehicle(null)
        const code = err?.errorCode
        if (code === 'VEHICLE_NOT_FOUND') {
          setError('Xe không tồn tại hoặc đã bị xóa')
        } else {
          setError('Lỗi tải thông tin xe')
        }
        console.error('[useVehicleDetail] Lỗi:', err)
      })
      .finally(() => setIsLoading(false))
  }, [vehicleToken, options?.preferManaged, isAuthenticated, user?.role])

  useEffect(() => {
    refetchVehicle()
  }, [refetchVehicle])

  useEffect(() => {
    const onInv = () => refetchVehicle()
    window.addEventListener(INVENTORY_CHANGED_EVENT, onInv)
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, onInv)
  }, [refetchVehicle])

  useEffect(() => {
    if (!isAuthenticated || !currentVehicleId) return

    interactionService
      .getSavedVehicles()
      .then((saved) => {
        setIsSaved(saved.some((s) => s.vehicleId === currentVehicleId))
      })
      .catch(() => {
        setIsSaved(false)
      })
  }, [isAuthenticated, currentVehicleId])

  const toggleSave = useCallback(async () => {
    if (!currentVehicleId) return

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      if (isSaved) {
        await interactionService.unsaveVehicle(currentVehicleId)
        setIsSaved(false)
      } else {
        await interactionService.saveVehicle(currentVehicleId)
        setIsSaved(true)
      }
    } catch (err: unknown) {
      const code = (err as { errorCode?: string })?.errorCode
      if (code === 'VEHICLE_ALREADY_SAVED') {
        setIsSaved(true)
      } else if (code === 'VEHICLE_NOT_SAVED') {
        setIsSaved(false)
      } else {
        console.warn('[useVehicleDetail] toggleSave lỗi:', err)
      }
    }
  }, [currentVehicleId, isSaved, isAuthenticated, navigate])

  return { vehicle, isLoading, error, isSaved, toggleSave, refetchVehicle }
}
