import { useQuery } from '@tanstack/react-query'
import {
  mockCatalogBrands,
  mockCatalogModels,
  mockCatalogColors,
  mockCatalogFuelTypes,
  mockCatalogTransmissions,
} from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useCatalog() {
  return useQuery({
    queryKey: ['admin-catalog', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        return {
          brands: mockCatalogBrands,
          models: mockCatalogModels,
          colors: mockCatalogColors,
          fuelTypes: mockCatalogFuelTypes,
          transmissions: mockCatalogTransmissions,
        }
      }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/catalog')
        return res.data ?? { brands: mockCatalogBrands, models: mockCatalogModels, colors: mockCatalogColors, fuelTypes: mockCatalogFuelTypes, transmissions: mockCatalogTransmissions }
      } catch {
        return { brands: mockCatalogBrands, models: mockCatalogModels, colors: mockCatalogColors, fuelTypes: mockCatalogFuelTypes, transmissions: mockCatalogTransmissions }
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
