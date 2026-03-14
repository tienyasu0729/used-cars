export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  branchId?: string
  branchName?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export const mockAdminUsers: AdminUser[] = [
  { id: 'USR-1092', name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0905 123 456', role: 'SalesStaff', branchId: 'branch1', branchName: 'Hải Châu, Đà Nẵng', status: 'active', createdAt: '2023-03-12' },
  { id: 'USR-1095', name: 'Lê Thị Thanh', email: 'thanh.le@example.com', phone: '0935 888 999', role: 'Customer', branchId: 'branch2', branchName: 'Thanh Khê, Đà Nẵng', status: 'active', createdAt: '2023-04-05' },
  { id: 'USR-1080', name: 'Trần Đình Bào', email: 'bao.tran@example.com', phone: '0914 444 333', role: 'BranchManager', branchId: 'branch3', branchName: 'Sơn Trà, Đà Nẵng', status: 'inactive', createdAt: '2023-01-10' },
  { id: 'USR-1102', name: 'Hoàng Thùy Chi', email: 'chi.hoang@example.com', phone: '0905 001 002', role: 'Admin', branchId: 'branch1', branchName: 'Hải Châu, Đà Nẵng', status: 'active', createdAt: '2023-05-20' },
]

export interface RolePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  approve: boolean
}

export interface AdminRole {
  id: string
  name: string
  description: string
  userCount: number
  permissions: Record<string, RolePermission>
}

const defaultPerms = (v = false, c = false, e = false, d = false, a = false): RolePermission => ({ view: v, create: c, edit: e, delete: d, approve: a })

export const mockAdminRoles: AdminRole[] = [
  { id: 'r0', name: 'Guest', description: 'Limited public access', userCount: 0, permissions: { inventory: defaultPerms(true), leads: defaultPerms(false), financial: defaultPerms(false), marketing: defaultPerms(false), users: defaultPerms(false), settings: defaultPerms(false) } },
  { id: 'r1', name: 'Customer', description: 'Standard registered user', userCount: 1240, permissions: { inventory: defaultPerms(true, true), leads: defaultPerms(true), financial: defaultPerms(false), marketing: defaultPerms(false), users: defaultPerms(false), settings: defaultPerms(false) } },
  { id: 'r2', name: 'Sales Staff', description: 'Inventory & leads access', userCount: 15, permissions: { inventory: defaultPerms(true, true, true, false, true), leads: defaultPerms(true, true, true, false, false), financial: defaultPerms(true), marketing: defaultPerms(true, true, true, true, true), users: defaultPerms(true), settings: defaultPerms(true) } },
  { id: 'r3', name: 'Manager', description: 'Administrative control', userCount: 3, permissions: { inventory: defaultPerms(true, true, true, false, true), leads: defaultPerms(true, true, true, false, false), financial: defaultPerms(true), marketing: defaultPerms(true, true, true, true, true), users: defaultPerms(true), settings: defaultPerms(true) } },
  { id: 'r4', name: 'Admin', description: 'Full system access', userCount: 2, permissions: { inventory: defaultPerms(true, true, true, true, true), leads: defaultPerms(true, true, true, true, true), financial: defaultPerms(true, true, true, true, true), marketing: defaultPerms(true, true, true, true, true), users: defaultPerms(true, true, true, true, true), settings: defaultPerms(true, true, true, true, true) } },
]

export interface AdminBranch {
  id: string
  name: string
  manager: string
  address: string
  phone: string
  status: 'active' | 'inactive'
  vehicleCount: number
  staffCount: number
  workingHours?: string
  imageUrl?: string
}

export const mockAdminBranches: AdminBranch[] = [
  { id: 'branch1', name: 'Da Nang Central', manager: 'Manager Danang', address: '123 Nguyễn Văn Linh', phone: '0236 123 4567', status: 'active', vehicleCount: 45, staffCount: 12, imageUrl: 'https://placehold.co/400x200/1a3c6e/white?text=Da+Nang+Central' },
  { id: 'branch2', name: 'Son Tra Branch', manager: 'Nguyễn Văn C', address: '456 Điện Biên Phủ', phone: '0236 234 5678', status: 'active', vehicleCount: 30, staffCount: 8, imageUrl: 'https://placehold.co/400x200/1a3c6e/white?text=Son+Tra' },
  { id: 'branch3', name: 'Lien Chieu Hub', manager: 'Lê Thị D', address: '789 Võ Nguyên Giáp', phone: '0236 345 6789', status: 'inactive', vehicleCount: 0, staffCount: 2, imageUrl: 'https://placehold.co/400x200/94a3b8/white?text=Lien+Chieu' },
  { id: 'branch4', name: 'Ngu Hanh Son Center', manager: 'Phạm Văn E', address: '321 Trường Chinh', phone: '0236 456 7890', status: 'active', vehicleCount: 25, staffCount: 10, imageUrl: 'https://placehold.co/400x200/1a3c6e/white?text=Ngu+Hanh+Son' },
]

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

export const mockCatalogBrands: CatalogBrand[] = [
  { id: 'b1', name: 'Toyota', slug: 'toyota', logoUrl: 'https://placehold.co/48x32/eb0a1e/white?text=T', vehicleCount: 1248, status: 'active' },
  { id: 'b2', name: 'Honda', slug: 'honda', logoUrl: 'https://placehold.co/48x32/000/white?text=H', vehicleCount: 856, status: 'active' },
  { id: 'b3', name: 'VinFast', slug: 'vinfast', logoUrl: 'https://placehold.co/48x32/003366/white?text=V', vehicleCount: 432, status: 'inactive' },
  { id: 'b4', name: 'Ford', slug: 'ford', logoUrl: 'https://placehold.co/48x32/003478/white?text=F', vehicleCount: 512, status: 'active' },
]

export const mockCatalogModels: CatalogModel[] = [
  { id: 'm1', name: 'Camry', brandId: 'b1', vehicleCount: 8, status: 'active' },
  { id: 'm2', name: 'Civic', brandId: 'b2', vehicleCount: 6, status: 'active' },
  { id: 'm3', name: 'Ranger', brandId: 'b3', vehicleCount: 5, status: 'active' },
]

export const mockCatalogColors: CatalogColor[] = [
  { id: 'c1', name: 'Đen', hex: '#1a1a1a', vehicleCount: 30, status: 'active' },
  { id: 'c2', name: 'Trắng', hex: '#ffffff', vehicleCount: 25, status: 'active' },
  { id: 'c3', name: 'Bạc', hex: '#c0c0c0', vehicleCount: 20, status: 'active' },
]

export const mockCatalogFuelTypes: CatalogFuelType[] = [
  { id: 'f1', name: 'Xăng', vehicleCount: 60, status: 'active' },
  { id: 'f2', name: 'Dầu', vehicleCount: 25, status: 'active' },
  { id: 'f3', name: 'Hybrid', vehicleCount: 10, status: 'active' },
]

export const mockCatalogTransmissions: CatalogTransmission[] = [
  { id: 't1', name: 'Số tự động', vehicleCount: 80, status: 'active' },
  { id: 't2', name: 'Số sàn', vehicleCount: 25, status: 'active' },
]

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

export const mockAdminTransfers: AdminTransfer[] = [
  { id: 't1', vehicleName: 'Toyota Camry 2.5Q 2024', vin: '4J1BU2JK5NU123456', fromBranch: 'Chi Nhánh Hải Châu', toBranch: 'Chi Nhánh Thanh Khê', status: 'pending', requestedBy: 'Nguyễn Văn A', createdAt: '2025-03-14T09:00:00' },
  { id: 't2', vehicleName: 'Honda Civic 2023', vin: '2HGFG2B58AH567890', fromBranch: 'Chi Nhánh Sơn Trà', toBranch: 'Chi Nhánh Hải Châu', status: 'approved', requestedBy: 'Tran Van B', createdAt: '2025-03-12T10:00:00' },
  { id: 't3', vehicleName: 'Toyota Vios 2023', vin: '4J1BU2JK5NU111111', fromBranch: 'Hải Châu', toBranch: 'Hội An', status: 'pending', requestedBy: 'Nguyễn Văn A', createdAt: '2025-03-13T14:00:00' },
  { id: 't4', vehicleName: 'Mazda CX-5 2024', vin: 'JM3KFBDM5N0123456', fromBranch: 'Chi Nhánh Thanh Khê', toBranch: 'Chi Nhánh Sơn Trà', status: 'pending', requestedBy: 'Lê Thị C', createdAt: '2025-03-14T08:00:00' },
  { id: 't5', vehicleName: 'VinFast VF8 2024', vin: 'VF8ABC1234567890', fromBranch: 'Chi Nhánh Hải Châu', toBranch: 'Chi Nhánh Thanh Khê', status: 'rejected', requestedBy: 'Phạm Văn D', createdAt: '2025-03-11T16:00:00' },
]

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

export const mockCMSBanners: AdminCMSBanner[] = [
  { id: 'bn1', title: 'Khuyến mãi Tháng 10 - Tặng 100% Thuế Trước Bạ', image: 'https://placehold.co/400x120/22c55e/white?text=Promo', link: 'banxeoto.vn/khuyen-mai-thang-10', status: 'published' },
  { id: 'bn2', title: 'Dịch vụ Spa Ô tô Cao Cấp tại Đà Nẵng', image: 'https://placehold.co/400x120/94a3b8/white?text=Spa', link: 'banxeoto.vn/dich-vu-spa', status: 'draft' },
]

export const mockCMSArticles: AdminCMSArticle[] = [
  { id: 'a1', title: 'Hướng dẫn mua xe đã qua sử dụng', category: 'Tin tức', author: 'Admin', publishedAt: '2025-03-01', status: 'published' },
]

export interface AdminReport {
  branchName: string
  revenue: number
  vehiclesSold: number
  orders: number
}

export const mockAdminReports: AdminReport[] = [
  { branchName: 'Chi Nhánh Hải Châu', revenue: 7200000000, vehiclesSold: 48, orders: 52 },
  { branchName: 'Chi Nhánh Thanh Khê', revenue: 5800000000, vehiclesSold: 38, orders: 42 },
  { branchName: 'Chi Nhánh Sơn Trà', revenue: 6500000000, vehiclesSold: 42, orders: 45 },
]

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

export const mockTopSellingVehicles: TopSellingVehicle[] = [
  { id: 'tv1', name: 'Toyota Camry 2023', category: 'Sedan • Luxury', image: 'https://placehold.co/80x60/1a3c6e/white?text=Camry', totalUnits: 24, topBranch: 'Hải Châu', revenue: 26400000000, status: 'LOW_STOCK' },
  { id: 'tv2', name: 'Mazda CX-5', category: 'SUV • Gia đình', image: 'https://placehold.co/80x60/1a3c6e/white?text=CX5', totalUnits: 18, topBranch: 'Sơn Trà', revenue: 16200000000, status: 'STABLE' },
  { id: 'tv3', name: 'VinFast VF8', category: 'Điện • SUV', image: 'https://placehold.co/80x60/1a3c6e/white?text=VF8', totalUnits: 15, topBranch: 'Hải Châu', revenue: 18000000000, status: 'HIGH_DEMAND' },
  { id: 'tv4', name: 'Hyundai Santa Fe', category: 'SUV • Luxury', image: 'https://placehold.co/80x60/1a3c6e/white?text=SantaFe', totalUnits: 12, topBranch: 'Liên Chiểu', revenue: 13200000000, status: 'STABLE' },
]

export interface AdminLog {
  id: string
  user: string
  action: string
  module: string
  timestamp: string
}

export const mockAdminLogs: AdminLog[] = [
  { id: 'l1', user: 'Admin', action: 'Đăng nhập', module: 'Auth', timestamp: '2025-03-14T08:30:00' },
  { id: 'l2', user: 'Tran Van B', action: 'Tạo yêu cầu điều chuyển', module: 'Transfers', timestamp: '2025-03-14T09:00:00' },
  { id: 'l3', user: 'Manager Danang', action: 'Cập nhật xe', module: 'Vehicles', timestamp: '2025-03-14T07:45:00' },
]

export interface AdminNotification {
  id: string
  title: string
  type: 'announcement' | 'email'
  createdAt: string
}

export const mockAdminNotifications: AdminNotification[] = [
  { id: 'n1', title: 'Thông báo bảo trì hệ thống', type: 'announcement', createdAt: '2025-03-14T08:00:00' },
]
