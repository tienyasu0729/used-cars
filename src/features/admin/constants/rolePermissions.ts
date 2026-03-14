import { Car, UserPlus, FileText, Megaphone, Users, Settings } from 'lucide-react'

export const FEATURE_MODULES = [
  { key: 'inventory', label: 'Quản lý kho xe', desc: 'Danh sách xe, tồn kho và media', icon: Car },
  { key: 'leads', label: 'Khách hàng & Khách hàng tiềm năng', desc: 'Hồ sơ người mua và khách hàng tiềm năng', icon: UserPlus },
  { key: 'financial', label: 'Báo cáo tài chính', desc: 'Hồ sơ bán hàng và hoa hồng', icon: FileText },
  { key: 'marketing', label: 'Marketing & Quảng cáo', desc: 'Khuyến mãi và banner quảng cáo', icon: Megaphone },
  { key: 'users', label: 'Quản lý người dùng', desc: 'Tài khoản nhân viên và vai trò', icon: Users },
  { key: 'settings', label: 'Cài đặt hệ thống', desc: 'Cấu hình toàn cục', icon: Settings },
] as const

export const PERM_COLS = ['view', 'create', 'edit', 'delete', 'approve'] as const

export const DEFAULT_PERMISSION = { view: false, create: false, edit: false, delete: false, approve: false }
