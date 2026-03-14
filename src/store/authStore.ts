import { create } from 'zustand'
import type { User } from '@/types'

const AUTH_KEY = 'auth'

function loadAuth(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return { user: null, token: null }
    const { user, token } = JSON.parse(raw)
    return user && token ? { user, token } : { user: null, token: null }
  } catch {
    return { user: null, token: null }
  }
}

function saveAuth(user: User, token: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }))
  localStorage.setItem('token', token)
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem('token')
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadAuth(),
  login: (user, token) => {
    saveAuth(user, token)
    set({ user, token })
  },
  logout: () => {
    clearAuth()
    set({ user: null, token: null })
  },
}))
