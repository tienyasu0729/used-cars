/**
 * Vehicle Service — Các API kết nối bảng vehicles & catalog ở DB
 */
import axiosInstance from '@/utils/axiosInstance'
import { normalizeVehicle, normalizeVehicleList } from '@/utils/vehicleMapper'
import type {
  Vehicle,
  Category,
  Subcategory,
  VehicleSearchParams,
  PaginatedResponse,
  CreateVehicleRequest,
} from '@/types/vehicle.types'

// Helper loại bỏ các thuộc tính undefined/null/rỗng cho HTTP Request (Params)
const cleanParams = (params?: unknown) => {
  if (!params || typeof params !== 'object') return undefined
  const cleaned: Record<string, unknown> = {}
  Object.keys(params as Record<string, unknown>).forEach((key) => {
    const val = (params as Record<string, unknown>)[key]
    if (val !== undefined && val !== null && val !== '') {
      cleaned[key] = val
    }
  })
  return cleaned
}

export const vehicleService = {
  /**
   * [PUBLIC] Lấy danh sách xe đã filter & phân trang
   * GET /vehicles?page=...&size=...&brand=...&minPrice=...&maxPrice=...
   */
  getVehicles: async (params?: VehicleSearchParams): Promise<PaginatedResponse<Vehicle>> => {
    // Lưu ý axiosInstance hiện tại được config interceptor: nó trả thẳng về `response.data` vì `ApiResponse<T>` wrapper.
    // Spec: { success, code, data: PaginatedResponse<Vehicle> }
    const res = await axiosInstance.get<{ data: PaginatedResponse<Vehicle> }>('/vehicles', {
      params: cleanParams(params),
    })
    
    // axios interceptor đã unwrap {data} lần 1, nhưng ta cần `data` nằm trong response format
    // do interceptor trả data thẳng, ở đây kiểu chính xác là ApiResponse<PaginatedResponse<Vehicle>>
    const apiRes = res as unknown as { data: PaginatedResponse<Vehicle>; success: boolean }
    if (!apiRes.data) {
       // Xử lý logic nếu res về mảng trần thay vì wrapped content (dựa theo thực tế API test sau)
       if (Array.isArray(apiRes)) {
         return {
           items: normalizeVehicleList(apiRes),
           meta: { totalElements: apiRes.length, totalPages: 1, page: 0, size: apiRes.length },
         }
       }
       const raw = apiRes as unknown as PaginatedResponse<unknown>
       return {
         ...raw,
         items: normalizeVehicleList(raw.items ?? []),
       }
    }
    const body = apiRes.data as PaginatedResponse<unknown>
    return {
      ...body,
      items: normalizeVehicleList(body.items ?? []),
    }
  },

  /**
   * [PUBLIC] Lấy chi tiết xe theo id
   * GET /vehicles/{id}
   */
  getVehicleById: async (id: number): Promise<Vehicle> => {
    const res = await axiosInstance.get<{ data: unknown }>(`/vehicles/${id}`)
    const raw = (res as unknown as { data: unknown }).data ?? res
    return normalizeVehicle(raw)
  },

  /**
   * [PUBLIC] Lấy danh sách hãng xe (categories)
   * GET /catalog/categories
   */
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosInstance.get<{ data: Category[] }>('/catalog/categories')
    return (res as unknown as { data: Category[] }).data ?? res
  },

  /**
   * [PUBLIC] Lấy danh sách dòng xe (subcategories) theo hãng
   * GET /catalog/subcategories?categoryId={categoryId}
   */
  getSubcategories: async (categoryId: number): Promise<Subcategory[]> => {
    const res = await axiosInstance.get<{ data: Subcategory[] }>('/catalog/subcategories', {
      params: { categoryId },
    })
    return (res as unknown as { data: Subcategory[] }).data ?? res
  },

  /**
   * [PUBLIC] Lấy danh sách xe vừa xem
   * GET /vehicles/recently-viewed
   * @param guestId UUID cho guest chưa đ/n, interceptor tự đẩy JWT nếu có login
   */
  getRecentlyViewed: async (guestId?: string): Promise<Vehicle[]> => {
    const headers = guestId ? { 'X-Guest-Id': guestId } : undefined
    const res = await axiosInstance.get<{ data: unknown[] }>('/vehicles/recently-viewed', { headers })
    const raw = (res as unknown as { data: unknown[] }).data ?? res
    return normalizeVehicleList(Array.isArray(raw) ? raw : [])
  },

  /**
   * [PUBLIC] Lấy chi tiết các xe để so sánh (max 3 params ids)
   * GET /vehicles/compare?ids=1,2,3
   */
  compareVehicles: async (ids: number[]): Promise<Vehicle[]> => {
    if (!ids || ids.length < 2 || ids.length > 3) {
      throw new Error('Chỉ có thể so sánh từ 2 đến 3 xe')
    }
    const res = await axiosInstance.get<{ data: unknown[] }>('/vehicles/compare', {
      params: { ids: ids.join(',') },
    })
    const raw = (res as unknown as { data: unknown[] }).data ?? res
    return normalizeVehicleList(Array.isArray(raw) ? raw : [])
  },

  /**
   * [CUSTOMER] Lưu xe yêu thích (yêu cầu JWT)
   * POST /vehicles/{id}/save
   */
  saveVehicle: async (vehicleId: number): Promise<void> => {
    await axiosInstance.post(`/vehicles/${vehicleId}/save`)
  },

  /**
   * [CUSTOMER] Bỏ lưu xe yêu thích (yêu cầu JWT)
   * DELETE /vehicles/{id}/save
   */
  unsaveVehicle: async (vehicleId: number): Promise<void> => {
    await axiosInstance.delete(`/vehicles/${vehicleId}/save`)
  },

  /**
   * [CUSTOMER] Xem xe đã lưu
   * GET /users/me/saved-vehicles
   */
  getSavedVehicles: async (): Promise<Vehicle[]> => {
    const res = await axiosInstance.get<{ data: unknown[] }>('/users/me/saved-vehicles')
    const raw = (res as unknown as { data: unknown[] }).data ?? res
    return normalizeVehicleList(Array.isArray(raw) ? raw : [])
  },

  /**
   * [MANAGER/ADMIN] Thêm xe mới
   * POST /manager/vehicles
   */
  createVehicle: async (data: CreateVehicleRequest): Promise<Vehicle> => {
    const res = await axiosInstance.post<{ data: unknown }>('/manager/vehicles', data)
    const raw = (res as unknown as { data: unknown }).data ?? res
    return normalizeVehicle(raw)
  },

  /**
   * [MANAGER/ADMIN] Sửa thông tin xe
   * PUT /manager/vehicles/{id}
   */
  updateVehicle: async (id: number, data: Partial<CreateVehicleRequest>): Promise<Vehicle> => {
    const res = await axiosInstance.put<{ data: unknown }>(`/manager/vehicles/${id}`, data)
    const raw = (res as unknown as { data: unknown }).data ?? res
    return normalizeVehicle(raw)
  },

  /**
   * [MANAGER/ADMIN] Xóa mềm xe (status = Hidden / isDeleted = 1)
   * DELETE /manager/vehicles/{id}
   */
  deleteVehicle: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/manager/vehicles/${id}`)
  },
}
