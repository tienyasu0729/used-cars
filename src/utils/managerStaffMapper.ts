import type { StaffListItemDto } from '@/services/managerStaff.service'
import type { ManagerStaffMember, StaffSystemRoleCode } from '@/mock/mockManagerData'
import type { UserProfile } from '@/types/auth.types'

function roleLabel(apiRole: string): string {
  if (apiRole === 'SalesStaff') return 'Nhân viên bán hàng'
  if (apiRole === 'BranchManager') return 'Quản lý chi nhánh'
  return apiRole
}

/** Chuỗi yyyy-mm-dd từ ISO instant */
function toDateOnly(iso: string | undefined): string {
  if (!iso) return '—'
  const d = iso.slice(0, 10)
  return d.length === 10 ? d : '—'
}

function dtoRoleToCode(role: string): StaffSystemRoleCode | undefined {
  if (role === 'SalesStaff' || role === 'BranchManager') return role
  return undefined
}

/** Admin luôn được; non-admin không được chỉnh nhân sự cùng mã vai trò hệ thống (đồng bộ với backend). */
export function canManagerMutateStaffRow(actor: UserProfile | null, row: ManagerStaffMember): boolean {
  if (!actor) return false
  if (actor.role === 'Admin') return true
  const code = row.staffRoleCode
  if (!code) return true
  return actor.role !== code
}

export function staffDtoToTableRow(dto: StaffListItemDto): ManagerStaffMember {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? '—',
    role: roleLabel(dto.role),
    staffRoleCode: dtoRoleToCode(dto.role),
    branchId: dto.branchId != null ? String(dto.branchId) : '—',
    startDate: toDateOnly(dto.createdAt),
    orderCount: 0,
    status: dto.status === 'active' ? 'active' : 'inactive',
  }
}
