/**
 * useManagerVehicles — Hook CRUD xe cho Manager/Admin
 *
 * Cung cấp: createVehicle, updateVehicle, deleteVehicle
 * Toast feedback + error handling theo error codes Dev 2
 */
import { useState, useCallback, useEffect } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useToastStore } from '@/store/toastStore'
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle.types'

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
  updateVehicle: (id: number, data: UpdateVehicleRequest) => Promise<Vehicle | null>
  /** Ẩn khỏi trang công khai — gọi sau khi user đã xác nhận trong UI */
  deleteVehicle: (id: number) => Promise<boolean>
  /** Hiển thị lại — gọi sau khi user đã xác nhận trong UI */
  restoreVehicleVisibility: (id: number) => Promise<boolean>
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
      setIsSubmitting(true)
      setError(null)
      try {
        await vehicleService.deleteVehicle(id)
        toast.addToast('success', 'Đã ẩn xe khỏi trang công khai')
        return true
      } catch (err) {
        handleError(err, 'Lỗi ẩn xe')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [toast, handleError]
  )

  const restoreVehicleVisibility = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await vehicleService.restoreVehicleVisibility(id)
        toast.addToast('success', 'Đã hiển thị lại tin đăng')
        return true
      } catch (err) {
        handleError(err, 'Lỗi hiển thị lại xe')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [toast, handleError]
  )

  return { createVehicle, updateVehicle, deleteVehicle, restoreVehicleVisibility, isSubmitting, error }
}

/**
 * useManagerVehicles — Danh sách xe trong phạm vi chi nhánh user quản lý (GET /manager/vehicles).
 * scope='NETWORK' → xem xe toàn hệ thống (read-only cho yêu cầu điều chuyển).
 */
export function useManagerVehicles(options?: { scope?: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scope = options?.scope

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true)
    try {
      if (scope === 'NETWORK') {
        // Lấy hết trang: backend tối đa 500/trang — gom đến hết totalPages
        const pageSize = 500
        const acc: Vehicle[] = []
        let page = 0
        let totalPages = 1
        while (page < totalPages) {
          const r = await vehicleService.getManagerVehicles({ page, size: pageSize, scope })
          acc.push(...r.items)
          totalPages = r.meta.totalPages
          page += 1
          if (r.items.length === 0) break
        }
        setVehicles(acc)
      } else {
        const result = await vehicleService.getManagerVehicles({ page: 0, size: 100, scope })
        setVehicles(result.items)
      }
    } catch (err) {
      console.error('[useManagerVehicles] Lỗi:', err)
    } finally {
      setIsLoading(false)
    }
  }, [scope])

  useEffect(() => {
    void fetchVehicles()
  }, [fetchVehicles])

  return { data: vehicles, isLoading, refetch: fetchVehicles }
}

/**
 * Chi tiết xe cho màn sửa manager — GET /manager/vehicles/:id (403 nếu xe thuộc chi nhánh khác).
 */
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
      .then((v) => {
        setVehicle(v)
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
