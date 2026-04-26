/**
 * KPI dashboard nhân viên — GET /staff/dashboard/stats
 */
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface StaffDashboardStats {
  todayBookings: number
  pendingBookings: number
  pendingConsultations: number
  pendingOrders: number
  weeklyOrders: number
  availableVehicles: number
}

function unwrapStats(res: unknown): StaffDashboardStats {
  const r = res as ApiResponse<StaffDashboardStats> | StaffDashboardStats
  const d =
    r && typeof r === 'object' && 'data' in r
      ? (r as ApiResponse<StaffDashboardStats>).data
      : (r as StaffDashboardStats)
  if (!d || typeof d !== 'object') throw new Error('STAFF_STATS_PARSE')
  const o = d as unknown as Record<string, unknown>
  const num = (key: string) => {
    const v = o[key]
    const x = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(x) ? x : 0
  }
  return {
    todayBookings: num('todayBookings'),
    pendingBookings: num('pendingBookings'),
    pendingConsultations: num('pendingConsultations'),
    pendingOrders: num('pendingOrders'),
    weeklyOrders: num('weeklyOrders'),
    availableVehicles: num('availableVehicles'),
  }
}

/**
 * @param branchId Bắt buộc khi role Admin (backend); BranchManager/SalesStaff có thể bỏ (server lấy từ JWT).
 */
export async function getStaffStats(branchId?: number): Promise<StaffDashboardStats> {
  const res = await axiosInstance.get<unknown>('/staff/dashboard/stats', {
    params: branchId != null ? { branchId } : undefined,
  })
  return unwrapStats(res)
}
