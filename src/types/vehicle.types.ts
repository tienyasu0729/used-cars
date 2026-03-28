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
export type VehicleStatus = 'Available' | 'Reserved' | 'Sold' | 'Hidden'

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
  brand?: number // category_id
  minPrice?: number
  maxPrice?: number
  /** Backend: postingDateDesc = mới đăng trước (posting_date giảm dần) */
  sort?: 'postingDateDesc' | 'posting_date_desc' | string
  // Các filter khác frontend xử lý
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
  images: {
    url: string
    sortOrder: number
    primaryImage: boolean
  }[]
}
