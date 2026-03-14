export interface ProfileExtras {
  userId: string
  dateOfBirth?: string
  address?: string
  gender?: 'male' | 'female' | 'other'
  verified?: boolean
  vip?: boolean
  memberSince?: string
  passwordUpdatedAt?: string
}

export const mockProfileExtras: Record<string, ProfileExtras> = {
  u1: {
    userId: 'u1',
    dateOfBirth: '1995-05-20',
    address: '123 Hàm Nghi, Quận Thanh Khê, Đà Nẵng',
    gender: 'male',
    verified: true,
    vip: true,
    memberSince: '10/2023',
    passwordUpdatedAt: '2 tháng trước',
  },
  u2: {
    userId: 'u2',
    dateOfBirth: '1990-01-15',
    address: '',
    gender: 'male',
    verified: true,
    vip: false,
    memberSince: '01/2024',
    passwordUpdatedAt: '1 tháng trước',
  },
  u3: {
    userId: 'u3',
    dateOfBirth: '1985-03-15',
    address: 'Đà Nẵng',
    gender: 'male',
    verified: true,
    vip: false,
    memberSince: '01/2023',
    passwordUpdatedAt: '1 tháng trước',
  },
  u4: {
    userId: 'u4',
    dateOfBirth: '1988-08-10',
    address: 'Đà Nẵng',
    gender: 'male',
    verified: true,
    vip: true,
    memberSince: '06/2023',
    passwordUpdatedAt: '3 tháng trước',
  },
}
