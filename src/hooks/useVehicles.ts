/**
 * useVehicles — Hook lấy danh sách xe từ API thật (Dev 2)
 *
 * Chuyển hoàn toàn sang dùng vehicleService.getVehicles()
 * Hỗ trợ filter (brand, minPrice, maxPrice) và phân trang
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { INVENTORY_CHANGED_EVENT } from '@/utils/inventorySync'
import type {
  Vehicle,
  VehicleSearchParams,
  PaginatedResponse,
} from '@/types/vehicle.types'

export type VehicleSearchParamsWithManaged = VehicleSearchParams & { managed?: boolean }

function stripManaged(p?: VehicleSearchParamsWithManaged): VehicleSearchParams {
  if (!p) return {}
  const { managed: _m, ...rest } = p
  return rest
}

interface UseVehiclesReturn {
  vehicles: Vehicle[]
  totalPages: number
  totalElements: number
  currentPage: number
  isLoading: boolean
  error: string | null
  /** State filter hiện tại (đồng bộ URL / chi nhánh) */
  filters: VehicleSearchParams
  setFilters: (filters: Partial<VehicleSearchParams>) => void
  setPage: (page: number) => void
  refetch: () => void
}

export function useVehicles(
  initialParams?: VehicleSearchParamsWithManaged
): UseVehiclesReturn {
  const managed = initialParams?.managed ?? false
  const managedRef = useRef(managed)
  managedRef.current = managed

  const [filters, setFiltersState] = useState<VehicleSearchParams>({
    page: 0,
    size: 20,
    sort: 'postingDateDesc',
    ...stripManaged(initialParams),
  })
  const [data, setData] = useState<PaginatedResponse<Vehicle> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Counter chống race-condition: bỏ qua response từ request cũ hơn
  const requestIdRef = useRef(0)

  /**
   * Khi đổi route (vd. /branches/1 → /branches/2), initialParams.branchId đổi nhưng useState không tự reset.
   * Đồng bộ branchId / size / sort từ tham số hook khi chúng thay đổi.
   */
  useEffect(() => {
    if (initialParams == null) return
    const initBranch = initialParams.branchId
    const initSize = initialParams.size
    const initSort = initialParams.sort
    const initStatus = initialParams.status
    if (
      initBranch === undefined &&
      initSize === undefined &&
      initSort === undefined &&
      initStatus === undefined
    )
      return

    setFiltersState((prev) => {
      const next = { ...prev }
      let changed = false
      if (initBranch !== undefined && prev.branchId !== initBranch) {
        next.branchId = initBranch
        changed = true
      }
      if (initSize !== undefined && prev.size !== initSize) {
        next.size = initSize
        changed = true
      }
      if (initSort !== undefined && prev.sort !== initSort) {
        next.sort = initSort
        changed = true
      }
      if (initStatus !== undefined && prev.status !== initStatus) {
        next.status = initStatus
        changed = true
      }
      if (!changed) return prev
      return { ...next, page: 0 }
    })
  }, [initialParams?.branchId, initialParams?.size, initialParams?.sort, initialParams?.status])

  // Fetch xe khi filter thay đổi — dùng requestId để bỏ qua response cũ (race-condition)
  const fetchVehicles = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current
    setIsLoading(true)
    setError(null)
    try {
      const result = managedRef.current
        ? await vehicleService.getManagerVehicles(filters)
        : await vehicleService.getVehicles(filters)
      // Chỉ dùng kết quả nếu đây vẫn là request mới nhất
      if (currentRequestId !== requestIdRef.current) return
      setData(result)
    } catch (err: unknown) {
      if (currentRequestId !== requestIdRef.current) return
      const msg = (err as { message?: string })?.message || 'Lỗi tải danh sách xe'
      setError(msg)
      console.error('[useVehicles] Lỗi:', err)
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [filters])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  useEffect(() => {
    const onInv = () => fetchVehicles()
    window.addEventListener(INVENTORY_CHANGED_EVENT, onInv)
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, onInv)
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
    filters,
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

    const load = () => {
      setIsLoading(true)
      vehicleService
        .getVehicleById(numericId)
        .then(setVehicle)
        .catch(() => setVehicle(null))
        .finally(() => setIsLoading(false))
    }
    load()
    const onInv = () => load()
    window.addEventListener(INVENTORY_CHANGED_EVENT, onInv)
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, onInv)
  }, [id])

  return { data: vehicle, isLoading }
}
