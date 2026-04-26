import { api } from './apiClient'
import type { BranchReportData } from '@/types/branchReports.types'

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export type ManagerReportsApi = {
  monthlyRevenue: number[]
  salesByBrand: { brand: string; count: number }[]
  topModels: Record<string, unknown>[]
  staffPerformance: Record<string, unknown>[]
}

export async function fetchManagerReports(branchId?: number | null): Promise<BranchReportData> {
  const res = await api.get<unknown>('/manager/reports', {
    params: branchId != null && branchId > 0 ? { branchId } : {},
  })
  const d = unwrap<ManagerReportsApi>(res.data)
  return {
    monthlyRevenue: Array.isArray(d?.monthlyRevenue) ? d.monthlyRevenue.map((n) => Number(n)) : [],
    salesByBrand: Array.isArray(d?.salesByBrand)
      ? d.salesByBrand.map((x) => ({ brand: String(x.brand), count: Number(x.count) }))
      : [],
    topModels: Array.isArray(d?.topModels)
      ? d.topModels.map((row) => ({
          subcategoryId: Number(row.subcategoryId ?? 0),
          modelName: String(row.modelName ?? ''),
          brandName: String(row.brandName ?? ''),
          soldCount: Number(row.soldCount ?? 0),
        }))
      : [],
  }
}
