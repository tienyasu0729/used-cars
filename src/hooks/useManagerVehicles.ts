import { useCallback, useEffect, useState } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useToastStore } from '@/store/toastStore'
import { notifyInventoryChanged } from '@/utils/inventorySync'
import { useVehicles } from '@/hooks/useVehicles'
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, VehicleSearchParams } from '@/types/vehicle.types'

const ERROR_MESSAGES: Record<string, string> = {
  BRAND_NOT_FOUND: 'Hãng xe không tồn tại',
  MODEL_NOT_FOUND: 'Dòng xe không tồn tại',
  BRANCH_NOT_FOUND: 'Chi nhánh không tồn tại',
  INVALID_PRICE: 'Giá xe không hợp lệ (phải lớn hơn 0)',
  INVALID_YEAR: 'Năm sản xuất không hợp lệ',
  LISTING_ID_CONFLICT: 'Trùng mã xe, vui lòng thử lại',
  VEHICLE_NOT_FOUND: 'Xe không tồn tại hoặc đã bị xóa',
}

interface UseManagerVehicleReturn {
  createVehicle: (data: CreateVehicleRequest) => Promise<Vehicle | null>
  updateVehicle: (id: number, data: Partial<UpdateVehicleRequest>) => Promise<Vehicle | null>
  deleteVehicle: (id: number) => Promise<boolean>
  restoreVehicleVisibility: (id: number) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
}

export function useManagerVehicle(): UseManagerVehicleReturn {
  const toast = useToastStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      const code = (err as { errorCode?: string })?.errorCode
      const msg = (code && ERROR_MESSAGES[code]) || fallback
      setError(msg)
      toast.addToast('error', msg)
      console.error('[useManagerVehicle] Lỗi:', err)
    },
    [toast],
  )

  const createVehicle = useCallback(
    async (data: CreateVehicleRequest): Promise<Vehicle | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const vehicle = await vehicleService.createVehicle(data)
        toast.addToast('success', 'Thêm xe thành công')
        notifyInventoryChanged()
        return vehicle
      } catch (err) {
        handleError(err, 'Lỗi tạo xe mới')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleError, toast],
  )

  const updateVehicle = useCallback(
    async (id: number, data: Partial<UpdateVehicleRequest>): Promise<Vehicle | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const vehicle = await vehicleService.updateVehicle(id, data)
        toast.addToast('success', 'Cập nhật thành công')
        notifyInventoryChanged()
        return vehicle
      } catch (err) {
        handleError(err, 'Lỗi cập nhật xe')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleError, toast],
  )

  const deleteVehicle = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await vehicleService.deleteVehicle(id)
        toast.addToast('success', 'Đã ẩn xe khỏi trang công khai')
        notifyInventoryChanged()
        return true
      } catch (err) {
        handleError(err, 'Lỗi ẩn xe')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleError, toast],
  )

  const restoreVehicleVisibility = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await vehicleService.restoreVehicleVisibility(id)
        toast.addToast('success', 'Đã hiển thị lại tin đăng')
        notifyInventoryChanged()
        return true
      } catch (err) {
        handleError(err, 'Lỗi hiển thị lại xe')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleError, toast],
  )

  return { createVehicle, updateVehicle, deleteVehicle, restoreVehicleVisibility, isSubmitting, error }
}

export function useManagerVehicles(options?: VehicleSearchParams & { fetchAll?: boolean }) {
  const vehiclesHook = useVehicles({
    managed: true,
    page: options?.page ?? 0,
    size: options?.size ?? 12,
    sort: options?.sort ?? 'idDesc',
    scope: options?.scope,
    status: options?.status,
    excludeStatus: options?.excludeStatus,
    q: options?.q,
    branchId: options?.branchId,
    brand: options?.brand,
    subcategoryId: options?.subcategoryId,
    minPrice: options?.minPrice,
    maxPrice: options?.maxPrice,
    yearMin: options?.yearMin,
    yearMax: options?.yearMax,
    transmission: options?.transmission,
  })

  return {
    data: vehiclesHook.vehicles,
    items: vehiclesHook.vehicles,
    isLoading: vehiclesHook.isLoading,
    error: vehiclesHook.error,
    totalPages: vehiclesHook.totalPages,
    totalElements: vehiclesHook.totalElements,
    currentPage: vehiclesHook.currentPage,
    filters: vehiclesHook.filters,
    setFilters: vehiclesHook.setFilters,
    setPage: vehiclesHook.setPage,
    refetch: vehiclesHook.refetch,
  }
}

export function useManagerManagedVehicle(id: string | number | undefined) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      setVehicle(null)
      setAccessDenied(false)
      return
    }

    const numericId = typeof id === 'string' ? parseInt(id, 10) : id
    if (Number.isNaN(numericId)) {
      setIsLoading(false)
      setVehicle(null)
      setAccessDenied(false)
      return
    }

    setIsLoading(true)
    setAccessDenied(false)
    vehicleService
      .getManagerVehicleById(numericId)
      .then((vehicle) => {
        setVehicle(vehicle)
        setAccessDenied(false)
      })
      .catch((err: unknown) => {
        const status = (err as { status?: number })?.status
        setVehicle(null)
        setAccessDenied(status === 403)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { data: vehicle, isLoading, accessDenied }
}
