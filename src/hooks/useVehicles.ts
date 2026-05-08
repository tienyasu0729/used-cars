import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicle.service'
import { INVENTORY_CHANGED_EVENT } from '@/utils/inventorySync'
import type { Vehicle, VehicleSearchParams, PaginatedResponse } from '@/types/vehicle.types'

export type VehicleSearchParamsWithManaged = VehicleSearchParams & { managed?: boolean }

function stripManaged(params?: VehicleSearchParamsWithManaged): VehicleSearchParams {
  if (!params) return {}
  const { managed: _managed, ...rest } = params
  return rest
}

interface UseVehiclesReturn {
  vehicles: Vehicle[]
  totalPages: number
  totalElements: number
  currentPage: number
  isLoading: boolean
  error: string | null
  filters: VehicleSearchParams
  setFilters: (filters: Partial<VehicleSearchParams>) => void
  setPage: (page: number) => void
  refetch: () => void
}

const VEHICLE_QUERY_STALE_TIME_MS = 30_000
const VEHICLE_QUERY_GC_TIME_MS = 5 * 60_000

export function useVehicles(initialParams?: VehicleSearchParamsWithManaged): UseVehiclesReturn {
  const managed = initialParams?.managed ?? false
  const managedRef = useRef(managed)
  managedRef.current = managed

  const [filters, setFiltersState] = useState<VehicleSearchParams>({
    page: 0,
    size: 20,
    sort: 'postingDateDesc',
    ...stripManaged(initialParams),
  })

  useEffect(() => {
    if (initialParams == null) return

    const nextInit = stripManaged(initialParams)
    if (
      nextInit.branchId === undefined &&
      nextInit.size === undefined &&
      nextInit.sort === undefined &&
      nextInit.status === undefined &&
      nextInit.q === undefined &&
      nextInit.brand === undefined &&
      nextInit.subcategoryId === undefined &&
      nextInit.minPrice === undefined &&
      nextInit.maxPrice === undefined &&
      nextInit.yearMin === undefined &&
      nextInit.yearMax === undefined &&
      nextInit.transmission === undefined &&
      nextInit.scope === undefined &&
      nextInit.excludeStatus === undefined
    ) {
      return
    }

    setFiltersState((prev) => {
      const candidate: VehicleSearchParams = {
        ...prev,
        ...Object.fromEntries(
          Object.entries(nextInit).filter(([, value]) => value !== undefined),
        ),
      }

      const changed =
        prev.branchId !== candidate.branchId ||
        prev.size !== candidate.size ||
        prev.sort !== candidate.sort ||
        prev.status !== candidate.status ||
        prev.q !== candidate.q ||
        prev.brand !== candidate.brand ||
        prev.subcategoryId !== candidate.subcategoryId ||
        prev.minPrice !== candidate.minPrice ||
        prev.maxPrice !== candidate.maxPrice ||
        prev.yearMin !== candidate.yearMin ||
        prev.yearMax !== candidate.yearMax ||
        prev.transmission !== candidate.transmission ||
        prev.scope !== candidate.scope ||
        prev.excludeStatus !== candidate.excludeStatus

      if (!changed) return prev
      return {
        ...candidate,
        page: 0,
      }
    })
  }, [
    initialParams?.branchId,
    initialParams?.size,
    initialParams?.sort,
    initialParams?.status,
    initialParams?.q,
    initialParams?.brand,
    initialParams?.subcategoryId,
    initialParams?.minPrice,
    initialParams?.maxPrice,
    initialParams?.yearMin,
    initialParams?.yearMax,
    initialParams?.transmission,
    initialParams?.scope,
    initialParams?.excludeStatus,
  ])

  const queryClient = useQueryClient()
  const query = useQuery<PaginatedResponse<Vehicle>, Error>({
    queryKey: ['vehicles', managed, filters],
    queryFn: async () => {
      return managedRef.current
        ? vehicleService.getManagerVehicles(filters)
        : vehicleService.getVehicles(filters)
    },
    placeholderData: (previousData) => previousData,
    staleTime: VEHICLE_QUERY_STALE_TIME_MS,
    gcTime: VEHICLE_QUERY_GC_TIME_MS,
  })

  useEffect(() => {
    const onInventoryChanged = () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    }
    window.addEventListener(INVENTORY_CHANGED_EVENT, onInventoryChanged)
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, onInventoryChanged)
  }, [queryClient])

  const setFilters = useCallback((newFilters: Partial<VehicleSearchParams>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: 0,
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }))
  }, [])

  const refetch = useCallback(() => {
    void query.refetch()
  }, [query])

  return {
    vehicles: query.data?.items ?? [],
    totalPages: query.data?.meta.totalPages ?? 0,
    totalElements: query.data?.meta.totalElements ?? 0,
    currentPage: query.data?.meta.page ?? 0,
    isLoading: query.isLoading || query.isFetching,
    error: query.error?.message ?? null,
    filters,
    setFilters,
    setPage,
    refetch,
  }
}

export function useVehicle(id: string | number | undefined) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id
    if (Number.isNaN(numericId)) {
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
    const onInventoryChanged = () => load()
    window.addEventListener(INVENTORY_CHANGED_EVENT, onInventoryChanged)
    return () => window.removeEventListener(INVENTORY_CHANGED_EVENT, onInventoryChanged)
  }, [id])

  return { data: vehicle, isLoading }
}
