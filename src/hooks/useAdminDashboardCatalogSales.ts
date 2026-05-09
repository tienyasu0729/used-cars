import { useQuery } from '@tanstack/react-query'
import { fetchAdminDashboardCatalogSales } from '@/services/adminDashboard.service'

export function useAdminDashboardCatalogSales(includeBrands = true) {
  return useQuery({
    queryKey: ['admin-dashboard-catalog-sales', includeBrands],
    queryFn: () => fetchAdminDashboardCatalogSales(includeBrands),
    staleTime: 60_000,
  })
}
