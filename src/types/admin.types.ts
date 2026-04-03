/** Kiểu domain Admin UI — không chứa dữ liệu giả; nguồn từ API /admin/*. */

export type AdminUserStatus = 'active' | 'inactive' | 'locked'

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  branchId?: string
  branchName?: string
  status: AdminUserStatus
  createdAt: string
  /** Ảnh đại diện từ backend (Cloudinary) — optional */
  avatarUrl?: string | null
}

/** Ma trận quyền UI cũ — không dùng cho API role (API dùng permissionIds). */
export interface RolePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  approve: boolean
}

export interface AdminPermissionRow {
  id: number
  module: string
  action: string
  description?: string | null
}

export interface AdminRole {
  id: string
  name: string
  userCount: number
  /** Chuỗi module.action từ backend */
  permissionKeys: string[]
  systemRole: boolean
}

export interface AdminBranch {
  id: string
  name: string
  /** Tên quản lý từ API (managerName) */
  managerName: string
  address: string
  phone: string
  status: 'active' | 'inactive'
  vehicleCount: number
  staffCount: number
  workingHours?: string
  imageUrl?: string
}

export interface CatalogBrand {
  id: string
  name: string
  slug: string
  logoUrl?: string
  vehicleCount: number
  status: 'active' | 'inactive'
}

export interface CatalogModel {
  id: string
  name: string
  brandId: string
  vehicleCount: number
  status: 'active' | 'inactive'
}

export interface CatalogColor {
  id: string
  name: string
  hex: string
  vehicleCount: number
  status: 'active' | 'inactive'
}

export interface CatalogFuelType {
  id: string
  name: string
  vehicleCount: number
  status: 'active' | 'inactive'
}

export interface CatalogTransmission {
  id: string
  name: string
  vehicleCount: number
  status: 'active' | 'inactive'
}

export interface AdminTransfer {
  id: string
  vehicleName: string
  vin?: string
  fromBranch: string
  toBranch: string
  status: 'pending' | 'approved' | 'rejected'
  requestedBy: string
  createdAt: string
}

export interface AdminCMSBanner {
  id: string
  title: string
  image: string
  link: string
  status: 'published' | 'draft'
}

export interface AdminCMSArticle {
  id: string
  title: string
  category: string
  author: string
  publishedAt: string
  status: 'published' | 'draft'
}

export interface AdminReport {
  branchName: string
  revenue: number
  vehiclesSold: number
  orders: number
}

export interface TopSellingVehicle {
  id: string
  name: string
  category: string
  image: string
  totalUnits: number
  topBranch: string
  revenue: number
  status: 'LOW_STOCK' | 'STABLE' | 'HIGH_DEMAND'
}

export interface AdminLog {
  id: string
  user: string
  action: string
  module: string
  timestamp: string
}

export interface AdminNotification {
  id: string
  title: string
  type: 'announcement' | 'email'
  createdAt: string
}
