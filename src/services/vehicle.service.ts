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
  UpdateVehicleRequest,
} from '@/types/vehicle.types'

// Helper loại bỏ các thuộc tính undefined/null/rỗng cho HTTP Request (Params)
const cleanParams = (params?: unknown) => {
  if (!params || typeof params !== 'object') return undefined
  const cleaned: Record<string, unknown> = {}
  Object.keys(params as Record<string, unknown>).forEach((key) => {
    const val = (params as Record<string, unknown>)[key]
    if (val === undefined || val === null || val === '') return
    if (typeof val === 'number' && Number.isNaN(val)) return
    cleaned[key] = val
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
   * [PUBLIC] Lấy chi tiết các xe để so sánh (max 3 params ids)
   * GET /vehicles/compare?ids=1,2,3
   */
  /**
   * [MANAGER/ADMIN] Danh sách xe thuộc chi nhánh được quản lý (không phải toàn bộ kho công khai).
   * GET /manager/vehicles
   */
  getManagerVehicles: async (params?: VehicleSearchParams): Promise<PaginatedResponse<Vehicle>> => {
    const res = await axiosInstance.get<{ data: PaginatedResponse<Vehicle> }>('/manager/vehicles', {
      params: cleanParams(params),
    })
    const apiRes = res as unknown as { data: PaginatedResponse<Vehicle>; success: boolean }
    if (!apiRes.data) {
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
   * [MANAGER/ADMIN] Chi tiết xe để sửa — 403 nếu không quản lý chi nhánh của xe.
   * GET /manager/vehicles/{id}
   */
  getManagerVehicleById: async (id: number): Promise<Vehicle> => {
    const res = await axiosInstance.get<{ data: unknown }>(`/manager/vehicles/${id}`)
    const raw = (res as unknown as { data: unknown }).data ?? res
    return normalizeVehicle(raw)
  },

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
  updateVehicle: async (id: number, data: Partial<UpdateVehicleRequest>): Promise<Vehicle> => {
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

  /**
   * [MANAGER/ADMIN] Hiển thị lại tin đăng công khai (gỡ is_deleted)
   * POST /manager/vehicles/{id}/restore-visibility
   */
  restoreVehicleVisibility: async (id: number): Promise<Vehicle> => {
    const res = await axiosInstance.post<{ data: unknown }>(`/manager/vehicles/${id}/restore-visibility`)
    const raw = (res as unknown as { data: unknown }).data ?? res
    return normalizeVehicle(raw)
  },
}
