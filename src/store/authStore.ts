/**
 * Auth Store — Zustand global state cho authentication
 * 
 * Tại sao refactor store cũ:
 * - Store cũ dùng key "auth" và "token" → chuyển sang "auth_token" + "auth_user" theo spec
 * - Thêm isLoading, isAuthenticated computed
 * - Thêm initializeFromStorage() để recover session khi F5 reload
 * 
 * Store này KHÔNG gọi API — chỉ quản lý state.
 * Logic gọi API nằm trong auth.service.ts và hooks.
 */

import { create } from 'zustand'
import type { UserProfile } from '@/types/auth.types'
import { useCompareStore } from './compareStore'

/** Key cố định trong localStorage — đồng bộ với auth.service.ts */
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const PERMISSIONS_KEY = 'auth_permissions'

interface AuthState {
  /** Thông tin user đang đăng nhập, null nếu chưa login */
  user: UserProfile | null
  /** JWT token, null nếu chưa login */
  token: string | null
  /** Computed: true nếu có token (đã đăng nhập) */
  isAuthenticated: boolean
  /** Flag đang gọi API (login/register) */
  isLoading: boolean
  /** Danh sách permission của user hiện tại (VD: ["Vehicles.create", "Orders.view"]) */
  permissions: string[]

  /** Lưu thông tin auth sau login thành công, persist vào localStorage */
  setAuth: (user: UserProfile, token: string) => void
  /** Lưu danh sách permission sau khi gọi API /me/permissions */
  setPermissions: (permissions: string[]) => void
  /** Xóa toàn bộ auth state + localStorage khi logout */
  clearAuth: () => void
  /** Alias UI — gọi cùng logic clearAuth */
  logout: () => void
  /** Đọc lại auth từ localStorage khi app khởi động (tránh mất session khi F5) */
  initializeFromStorage: () => void
  /** Set trạng thái loading (dùng trong hooks khi gọi API) */
  setLoading: (loading: boolean) => void
  /** Gộp dữ liệu profile sau GET/PUT /users/me hoặc đổi avatar */
  patchUser: (partial: Partial<UserProfile>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  permissions: [],

  setAuth: (user, token) => {
    // Persist vào localStorage để không mất khi reload (một key token chuẩn)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    set({ user, token, isAuthenticated: true })
  },

  setPermissions: (permissions) => {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
    set({ permissions })
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(PERMISSIONS_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem('auth')

    useCompareStore.getState().clear()

    set({ user: null, token: null, isAuthenticated: false, permissions: [] })
  },

  logout: () => get().clearAuth(),

  initializeFromStorage: () => {
    // Recover session từ localStorage khi app khởi động
    // Tại sao cần: khi user F5 reload, Zustand state bị reset,
    // nhưng token vẫn còn trong localStorage → đọc lại để giữ session
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedUser = localStorage.getItem(USER_KEY)

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser) as UserProfile
        const savedPerms = localStorage.getItem(PERMISSIONS_KEY)
        const parsedPerms = savedPerms ? JSON.parse(savedPerms) as string[] : []
        set({
          user: parsedUser,
          token: savedToken,
          isAuthenticated: true,
          permissions: parsedPerms,
        })
      }
    } catch (parseError) {
      // Nếu dữ liệu trong localStorage bị corrupt thì xóa sạch
      console.error('[authStore] Lỗi parse dữ liệu từ localStorage:', parseError)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  patchUser: (partial) => {
    const prev = get().user
    if (!prev) return
    const next: UserProfile = { ...prev, ...partial }
    localStorage.setItem(USER_KEY, JSON.stringify(next))
    set({ user: next })
  },
}))

// ============================================================
// AUTO-INITIALIZE
// ============================================================
// Gọi ngay khi module được import lần đầu → recover session nếu có
// Tại sao dùng cách này thay vì useEffect: 
// Zustand store là singleton, chạy 1 lần khi import → đảm bảo 
// state sẵn sàng trước khi React render lần đầu.
useAuthStore.getState().initializeFromStorage()
