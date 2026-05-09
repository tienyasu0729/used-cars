import { create } from 'zustand'
import { useAuthStore } from '@/store/authStore'

/**
 * Modal chặn toàn màn hình khi backend trả ACCOUNT_SUSPENDED trong phiên nội bộ (staff/manager/admin).
 * Không dùng cho POST /auth/login|register — xem shouldOpenAccountSuspendedModal.
 * Chỉ đóng được khi người dùng xác nhận → clear session + chuyển /login.
 */
interface SessionRevokedState {
  open: boolean
  apiMessage: string | null
  /** Mở một lần cho tới khi confirm (tránh spam từ nhiều request song song). */
  openBlocking: (apiMessage?: string) => void
  confirmAndLogout: () => void
}

export const useSessionRevokedStore = create<SessionRevokedState>((set, get) => ({
  open: false,
  apiMessage: null,

  openBlocking: (msg) => {
    if (get().open) return
    set({ open: true, apiMessage: msg?.trim() || null })
  },

  confirmAndLogout: () => {
    set({ open: false, apiMessage: null })
    useAuthStore.getState().clearAuth()
    window.location.assign('/login')
  },
}))
