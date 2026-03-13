export type UserRole = 'Guest' | 'Customer' | 'SalesStaff' | 'BranchManager' | 'Admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  branchId?: string
  avatar?: string
}
