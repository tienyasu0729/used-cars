export type UserRole = 'admin' | 'showroom' | 'customer' | 'partner' | 'finance' | 'inspector' | 'staff'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: UserRole
}
