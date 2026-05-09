/**
 * KPI dashboard quản lý chi nhánh — GET /manager/dashboard/stats
 */
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface ManagerDashboardStats {
  monthlyRevenue: number
  revenueChange: number
  vehiclesSold: number
  totalInventory: number
  weeklyAppointments: number
  topStaff: unknown[]
}

function unwrapStats(res: unknown): ManagerDashboardStats {
  const r = res as ApiResponse<Record<string, unknown>> | Record<string, unknown>
  const d =
    r && typeof r === 'object' && 'data' in r
      ? (r as ApiResponse<Record<string, unknown>>).data
      : (r as Record<string, unknown>)
  if (!d || typeof d !== 'object') throw new Error('MANAGER_STATS_PARSE')
  const num = (key: string) => {
    const v = d[key]
    const x = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(x) ? x : 0
  }
  const topStaff = Array.isArray(d.topStaff) ? d.topStaff : []
  return {
    monthlyRevenue: num('monthlyRevenue'),
    revenueChange: num('revenueChange'),
    vehiclesSold: num('vehiclesSold'),
    totalInventory: num('totalInventory'),
    weeklyAppointments: num('weeklyAppointments'),
    topStaff,
  }
}

/**
 * @param branchId Bắt buộc khi role Admin; BranchManager có thể bỏ.
 */
export async function getManagerStats(branchId?: number): Promise<ManagerDashboardStats> {
  const res = await axiosInstance.get<unknown>('/manager/dashboard/stats', {
    params: branchId != null ? { branchId } : undefined,
  })
  return unwrapStats(res)
}
