import { api } from './apiClient'
import { mockUsers } from '@/mock'
import { isMockMode } from '@/config/dataSource'
import type { User } from '@/types'
import type { UserRole } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

const roleMap: Record<string, UserRole> = {
  customer: 'Customer',
  staff: 'SalesStaff',
  admin: 'Admin',
}

function toUser(m: (typeof mockUsers)[0]): User {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: '0900000000',
    role: roleMap[m.role] ?? 'Customer',
    branchId: 'branchId' in m ? m.branchId : undefined,
  }
}

async function mockLogin(email: string, password: string): Promise<LoginResponse> {
  const u = mockUsers.find((m) => m.email.toLowerCase() === email.toLowerCase())
  if (!u || u.password !== password) {
    throw new Error('Email hoặc mật khẩu không đúng')
  }
  return {
    token: `mock-token-${u.id}`,
    user: toUser(u),
  }
}

export const authApi = {
  async login(data: LoginPayload): Promise<LoginResponse> {
    if (isMockMode()) {
      return mockLogin(data.email, data.password)
    }
    const res = await api.post<LoginResponse>('/auth/login', data)
    return res.data
  },
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
}
