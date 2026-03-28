/**
 * useManagerVehicles — Hook CRUD xe cho Manager/Admin
 *
 * Cung cấp: createVehicle, updateVehicle, deleteVehicle
 * Toast feedback + error handling theo error codes Dev 2
 */
import { useState, useCallback } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useToastStore } from '@/store/toastStore'
import type { Vehicle, CreateVehicleRequest } from '@/types/vehicle.types'

// Map error code sang message thân thiện
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
  updateVehicle: (id: number, data: Partial<CreateVehicleRequest>) => Promise<Vehicle | null>
  deleteVehicle: (id: number) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
}

export function useManagerVehicle(): UseManagerVehicleReturn {
  const toast = useToastStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Xử lý error code từ backend
  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      const code = (err as { errorCode?: string })?.errorCode
      const msg = (code && ERROR_MESSAGES[code]) || fallback
      setError(msg)
      toast.addToast('error', msg)
      console.error('[useManagerVehicle] Lỗi:', err)
    },
    [toast]
  )

  const createVehicle = useCallback(
    async (data: CreateVehicleRequest): Promise<Vehicle | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const vehicle = await vehicleService.createVehicle(data)
        toast.addToast('success', 'Thêm xe thành công')
        return vehicle
      } catch (err) {
        handleError(err, 'Lỗi tạo xe mới')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [toast, handleError]
  )

  const updateVehicle = useCallback(
    async (id: number, data: Partial<CreateVehicleRequest>): Promise<Vehicle | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const vehicle = await vehicleService.updateVehicle(id, data)
        toast.addToast('success', 'Cập nhật thành công')
        return vehicle
      } catch (err) {
        handleError(err, 'Lỗi cập nhật xe')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [toast, handleError]
  )

  const deleteVehicle = useCallback(
    async (id: number): Promise<boolean> => {
      // Confirm trước khi xóa
      if (!window.confirm('Bạn có chắc muốn xóa xe này?')) return false

      setIsSubmitting(true)
      setError(null)
      try {
        await vehicleService.deleteVehicle(id)
        toast.addToast('success', 'Đã xóa xe')
        return true
      } catch (err) {
        handleError(err, 'Lỗi xóa xe')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [toast, handleError]
  )

  return { createVehicle, updateVehicle, deleteVehicle, isSubmitting, error }
}

/**
 * useManagerVehicles — Hook lấy danh sách xe cho manager (backward compat)
 */
export function useManagerVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true)
    try {
      // Dùng API public list (manager thấy tất cả xe)
      const result = await vehicleService.getVehicles({ page: 0, size: 100 })
      setVehicles(result.items)
    } catch (err) {
      console.error('[useManagerVehicles] Lỗi:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useState(() => { fetchVehicles() })

  return { data: vehicles, isLoading, refetch: fetchVehicles }
}
