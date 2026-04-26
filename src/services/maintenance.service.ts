/**
 * Maintenance Service — Các API lịch sử bảo dưỡng xe
 */
import axiosInstance from '@/utils/axiosInstance'

// Kiểu dữ liệu bảo dưỡng
export interface MaintenanceRecord {
  id: number
  vehicleId: number
  maintenanceDate: string
  description: string
  cost: number
  performedBy: string | null
  createdAt: string
}

export interface CreateMaintenancePayload {
  maintenanceDate: string
  description: string
  cost: number
  performedBy?: string
}

// Kiểu phân trang từ Spring Boot Page<T>
interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const maintenanceService = {
  /**
   * [PUBLIC] Lấy lịch sử bảo dưỡng công khai — không cần đăng nhập.
   * GET /vehicles/{vehicleId}/maintenance
   */
  getPublicHistory: async (vehicleId: number, page = 0, size = 50): Promise<PageResponse<MaintenanceRecord>> => {
    const res = await axiosInstance.get<{ data: PageResponse<MaintenanceRecord> }>(
      `/vehicles/${vehicleId}/maintenance`,
      { params: { page, size } },
    )
    const apiRes = res as unknown as { data: PageResponse<MaintenanceRecord> }
    return apiRes.data ?? (res as unknown as PageResponse<MaintenanceRecord>)
  },

  /**
   * [MANAGER/ADMIN] Lấy danh sách bảo dưỡng của xe — phân trang.
   * GET /manager/vehicles/{vehicleId}/maintenance
   */
  getHistory: async (vehicleId: number, page = 0, size = 20): Promise<PageResponse<MaintenanceRecord>> => {
    const res = await axiosInstance.get<{ data: PageResponse<MaintenanceRecord> }>(
      `/manager/vehicles/${vehicleId}/maintenance`,
      { params: { page, size } },
    )
    const apiRes = res as unknown as { data: PageResponse<MaintenanceRecord> }
    return apiRes.data ?? (res as unknown as PageResponse<MaintenanceRecord>)
  },

  /**
   * [MANAGER/ADMIN] Tạo bản ghi bảo dưỡng mới.
   * POST /manager/vehicles/{vehicleId}/maintenance
   */
  create: async (vehicleId: number, data: CreateMaintenancePayload): Promise<MaintenanceRecord> => {
    const res = await axiosInstance.post<{ data: MaintenanceRecord }>(
      `/manager/vehicles/${vehicleId}/maintenance`,
      data,
    )
    const apiRes = res as unknown as { data: MaintenanceRecord }
    return apiRes.data ?? (res as unknown as MaintenanceRecord)
  },
}
