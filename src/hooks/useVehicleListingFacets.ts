import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicle.service'

export interface VehicleListingFacets {
  categoryIds: number[]
  subcategoryIdsByCategory: Record<number, number[]>
  priceMin: number
  priceMax: number
  isLoading: boolean
  error: string | null
}

export function useVehicleListingFacets(): VehicleListingFacets {
  const query = useQuery({
    queryKey: ['vehicle-listing-facets'],
    queryFn: () => vehicleService.getVehicleListingFacets(),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })

  return useMemo(
    () => ({
      categoryIds: query.data?.categoryIds ?? [],
      subcategoryIdsByCategory: query.data?.subcategoryIdsByCategory ?? {},
      priceMin: query.data?.priceMin ?? 0,
      priceMax: query.data?.priceMax ?? 0,
      isLoading: query.isLoading || query.isFetching,
      error: query.error instanceof Error ? query.error.message : null,
    }),
    [query.data, query.error, query.isFetching, query.isLoading],
  )
}
