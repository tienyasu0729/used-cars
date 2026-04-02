/** Vai trò hệ thống từ API — ẩn hành động đồng cấp (BranchManager không sửa BranchManager khác). */
export type StaffSystemRoleCode = 'SalesStaff' | 'BranchManager'

/** Dòng bảng nhân viên manager — map từ API + `staffDtoToTableRow`. */
export interface ManagerStaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  branchId: string
  startDate: string
  orderCount: number
  status: 'active' | 'inactive'
  avatar?: string
  staffRoleCode?: StaffSystemRoleCode
}
