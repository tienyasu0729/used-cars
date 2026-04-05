/**
 * Vehicle Types — Định nghĩa cấu trúc dữ liệu cho Vehicle theo chuẩn backend DEV 2
 */

// Format chung API Response bọc trong utils/axiosInstance.ts đã có:
export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// ============================================================
// DỮ LIỆU CƠ BẢN
// ============================================================
export type VehicleStatus = 'Available' | 'Reserved' | 'Sold' | 'Hidden' | 'InTransfer'

export interface VehicleImage {
  id: number
  url: string
  sortOrder: number
  primaryImage: boolean
}

export interface Vehicle {
  id: number
  listing_id: string
  title: string
  price: number
  year: number
  /** Tóm tắt API có thể không gửi — dùng optional */
  mileage?: number
  fuel: string // "Xăng" | "Dầu" | "Điện" | "Hybrid"
  transmission: string // "Số tự động" | "Số sàn"
  status: VehicleStatus
  /** Có cọc Pending / Confirmed / AwaitingPayment — trùng điều kiện chặn đặt cọc mới */
  listing_hold_active?: boolean
  /** ID cọc AwaitingPayment của user hiện tại cho xe này (null nếu không có hoặc chưa login) */
  my_pending_deposit_id?: number | null
  /** true = đã ẩn khỏi tin đăng công khai (xóa mềm), vẫn xem trong quản lý chi nhánh */
  deleted?: boolean
  category_id: number
  subcategory_id: number
  branch_id: number
  images: VehicleImage[]
  created_at?: string
  /** Chi tiết API */
  description?: string
  body_style?: string
  origin?: string
  /** ISO date string từ postingDate */
  posting_date?: string
  branch_name?: string

  // Frontend virtual field if backend missing these
  brand?: string // Trả về thông qua inner join tuỳ backend
  model?: string 
  trim?: string
  exteriorColor?: string
  interiorColor?: string
  engine?: string
  horsepower?: number
  wheelbaseMm?: number
  airbags?: number
  safetySystem?: string
}

// Danh mục
export interface Category {
  id: number
  name: string
  status?: string
}

export interface Subcategory {
  id: number
  name: string
  category_id: number
}

// ============================================================
// REQUEST PARAMS & BODY
// ============================================================
export interface VehicleSearchParams {
  page?: number
  size?: number
  /** Từ khóa tìm kiếm — tìm trong tiêu đề xe (backend LIKE %q%) */
  q?: string
  brand?: number // category_id → query `brand`
  subcategoryId?: number
  minPrice?: number
  maxPrice?: number
  yearMin?: number
  yearMax?: number
  transmission?: string
  /** Lọc xe theo chi nhánh (branch.id) */
  branchId?: number
  /** Trạng thái xe (GET /manager/vehicles?status=) — Available | Reserved | Sold | … */
  status?: string
  /** postingDateDesc | priceAsc | priceDesc | yearDesc | idDesc */
  sort?: string
  /** NETWORK = toàn hệ thống (read-only cho Transfer) */
  scope?: string
}

export interface CreateVehicleRequest {
  categoryId: number
  subcategoryId: number
  branchId: number
  title: string
  price: number
  year: number
  mileage: number
  fuel?: string
  transmission?: string
  /** Khớp cột description (NVARCHAR MAX) */
  description?: string
  /** Khớp body_style */
  bodyStyle?: string
  /** Khớp origin */
  origin?: string
  images: {
    url: string
    sortOrder: number
    primaryImage: boolean
  }[]
}

/** PUT /manager/vehicles/{id} — khớp VehicleUpdateRequest (Java). */
export interface UpdateVehicleRequest extends CreateVehicleRequest {
  status: VehicleStatus
  /** yyyy-mm-dd hoặc để trống */
  postingDate?: string | null
}
