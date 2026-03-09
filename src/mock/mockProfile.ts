export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
}

export const mockUserProfile: UserProfile = {
  id: 'user-001',
  name: 'Customer Test',
  email: 'customer@test.com',
  phone: '0901234567',
}
