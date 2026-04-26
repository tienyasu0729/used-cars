import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminCatalogBrands,
  fetchAdminCatalogModels,
  fetchFuelTypes,
  fetchTransmissions,
} from '@/services/adminCatalog.service'

export function useAdminCatalogBrands(q: string, page: number, size: number) {
  return useQuery({
    queryKey: ['admin-catalog-brands', q, page, size],
    queryFn: () => fetchAdminCatalogBrands(q, page, size),
    staleTime: 30_000,
  })
}

export function useAdminCatalogModels(
  q: string,
  categoryId: number | undefined,
  page: number,
  size: number,
) {
  return useQuery({
    queryKey: ['admin-catalog-models', q, categoryId ?? '', page, size],
    queryFn: () => fetchAdminCatalogModels(q, categoryId, page, size),
    staleTime: 30_000,
  })
}

export function useAdminCatalogFuelTypes() {
  return useQuery({
    queryKey: ['admin-catalog-fuel-types'],
    queryFn: fetchFuelTypes,
    staleTime: 30_000,
  })
}

export function useAdminCatalogTransmissions() {
  return useQuery({
    queryKey: ['admin-catalog-transmissions'],
    queryFn: fetchTransmissions,
    staleTime: 30_000,
  })
}
