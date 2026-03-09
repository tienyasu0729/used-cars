import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface ResetPasswordPayload {
  email: string
}

export const authApi = {
  async login(email: string, password: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { MOCK_CREDENTIALS } = await import('@/mock/mockAuth')
        const cred = MOCK_CREDENTIALS.find((c) => c.email === email.trim() && c.password === password)
        return cred ? { success: true, userId: cred.userId } : { success: false }
      })
    }
    const res = await httpClient.post<{ success: boolean; userId?: string }>('/auth/login', { email, password })
    return res.data
  },

  async register(data: RegisterPayload) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({ success: true, userId: `user-${Date.now()}` })
    }
    const res = await httpClient.post<{ success: boolean; userId?: string }>('/auth/register', data)
    return res.data
  },

  async resetPassword(email: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({ success: true })
    }
    const res = await httpClient.post<{ success: boolean }>('/auth/reset-password', { email })
    return res.data
  },

  async logout() {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/auth/logout')
    return { success: true }
  },
}
