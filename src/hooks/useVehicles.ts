/**
 * useVehicles — Hook lấy danh sách xe từ API thật (Dev 2)
 *
 * Chuyển hoàn toàn sang dùng vehicleService.getVehicles()
 * Hỗ trợ filter (brand, minPrice, maxPrice) và phân trang
 */
import { useState, useEffect, useCallback } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import type {
  Vehicle,
  VehicleSearchParams,
  PaginatedResponse,
} from '@/types/vehicle.types'

interface UseVehiclesReturn {
  vehicles: Vehicle[]
  totalPages: number
  totalElements: number
  currentPage: number
  isLoading: boolean
  error: string | null
  setFilters: (filters: Partial<VehicleSearchParams>) => void
  setPage: (page: number) => void
  refetch: () => void
}

export function useVehicles(
  initialParams?: VehicleSearchParams
): UseVehiclesReturn {
  const [filters, setFiltersState] = useState<VehicleSearchParams>({
    page: 0,
    size: 20,
    ...initialParams,
  })
  const [data, setData] = useState<PaginatedResponse<Vehicle> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch xe khi filter thay đổi
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await vehicleService.getVehicles(filters)
      setData(result)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Lỗi tải danh sách xe'
      setError(msg)
      console.error('[useVehicles] Lỗi:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Khi thay đổi filter → reset page về 0
  const setFilters = useCallback((newFilters: Partial<VehicleSearchParams>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: 0, // Reset page khi đổi filter
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }))
  }, [])

  return {
    vehicles: data?.items ?? [],
    totalPages: data?.meta.totalPages ?? 0,
    totalElements: data?.meta.totalElements ?? 0,
    currentPage: data?.meta.page ?? 0,
    isLoading,
    error,
    setFilters,
    setPage,
    refetch: fetchVehicles,
  }
}

/**
 * useVehicle — Hook lấy chi tiết 1 xe theo id (backward compat)
 * Redirect từ hook cũ (string id) sang API mới (number id)
 */
export function useVehicle(id: string | number | undefined) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id
    if (isNaN(numericId)) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    vehicleService
      .getVehicleById(numericId)
      .then(setVehicle)
      .catch(() => setVehicle(null))
      .finally(() => setIsLoading(false))
  }, [id])

  return { data: vehicle, isLoading }
}
