import type { AdminDashboardCatalogSales } from '@/types/admin.types'
import { api } from './apiClient'

export type AdminDashboardStats = {
  totalRevenue: number
  totalVehiclesSold: number
  totalInventory: number
  newCustomers: number
  activeBranches: number
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await api.get<unknown>('/admin/dashboard/stats')
  return unwrap<AdminDashboardStats>(res.data)
}

export async function fetchAdminDashboardCatalogSales(
  includeBrands = true,
): Promise<AdminDashboardCatalogSales> {
  const res = await api.get<unknown>('/admin/dashboard/catalog-sales', {
    params: { includeBrands },
  })
  return unwrap<AdminDashboardCatalogSales>(res.data)
}
