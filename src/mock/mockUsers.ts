import type { User } from '@/types'

export const mockCurrentUser: User = {
  id: 'user-001',
  name: 'John Doe',
  email: 'john.doe@showroom.com',
  role: 'showroom',
}

export const mockAdminUser: User = {
  id: 'admin-001',
  name: 'Super Admin SCUDN',
  email: 'admin@scudn.vn',
  role: 'admin',
}

export const mockStaffUser: User = {
  id: 'staff-001',
  name: 'Admin Staff SCUDN',
  email: 'staff@scudn.vn',
  role: 'staff',
}

export const mockInspectorUser: User = {
  id: 'inspector-001',
  name: 'Inspector SCUDN',
  email: 'inspector@scudn.vn',
  role: 'inspector',
}

export const mockFinanceUser: User = {
  id: 'finance-001',
  name: 'Vietcombank Auto Finance',
  email: 'finance@vcb.com.vn',
  role: 'finance',
}
