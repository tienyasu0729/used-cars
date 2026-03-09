import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { MOCK_CREDENTIALS } from '@/mock/mockAuth'
import { mockAdminUser, mockStaffUser, mockFinanceUser, mockInspectorUser, mockCurrentUser } from '@/mock/mockUsers'

const USER_MAP: Record<string, User> = {
  'admin-001': mockAdminUser,
  'staff-001': mockStaffUser,
  'finance-001': mockFinanceUser,
  'inspector-001': mockInspectorUser,
  'user-001': mockCurrentUser,
  'customer-001': { id: 'customer-001', name: 'Customer Test', email: 'customer@test.com', role: 'customer' },
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        const cred = MOCK_CREDENTIALS.find(
          (c) => c.email === email.trim() && c.password === password
        )
        if (!cred) return false
        const user = USER_MAP[cred.userId]
        if (!user) return false
        set({ user, isAuthenticated: true })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'scudn-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)
