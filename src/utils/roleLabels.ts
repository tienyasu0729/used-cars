import type { UserRole } from '@/types'

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Quản trị viên hệ thống',
  BranchManager: 'Quản lý chi nhánh',
  SalesStaff: 'Nhân viên bán hàng',
  Customer: 'Khách hàng',
  Guest: 'Khách',
}

export function getRoleLabel(role?: UserRole | string | null): string {
  if (!role) return 'Quản trị viên hệ thống'
  return ROLE_LABELS[role as UserRole] ?? role
}
