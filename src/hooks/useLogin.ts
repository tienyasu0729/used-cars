/**
 * useLogin Hook — Xử lý toàn bộ logic đăng nhập
 * 
 * Tại sao tách hook ra khỏi component:
 * - LoginPage chỉ lo render UI, không chứa business logic
 * - Hook này handle: gọi API → parse error → redirect theo role
 * - Dễ test và tái sử dụng nếu có nhiều nơi cần login (VD: modal login)
 */

import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '@/services/auth.service'
import { interactionService } from '@/services/interaction.service'
import { useAuthStore } from '@/store/authStore'
import type { LoginRequest, ApiErrorResponse } from '@/types/auth.types'
import type { UserProfile } from '@/types/auth.types'

interface UseLoginReturn {
  /** Gọi hàm này khi submit form login */
  login: (loginData: LoginRequest) => Promise<void>
  /** true khi đang gọi API login */
  isLoading: boolean
  /** Lỗi chung (ví dụ: "Sai email hoặc mật khẩu") */
  error: string | null
  /** Lỗi theo từng field (ví dụ: { email: "Email không hợp lệ" }) */
  fieldErrors: Record<string, string>
  /** Xóa tất cả lỗi (dùng khi user bắt đầu nhập lại) */
  clearErrors: () => void
}

/**
 * Map role → đường dẫn redirect mặc định sau login.
 * Customer → /dashboard, Staff → /staff, Manager → /manager, Admin → /admin
 */
function getRedirectPathByRole(role: UserProfile['role']): string {
  const roleRedirectMap: Record<UserProfile['role'], string> = {
    Customer: '/dashboard',
    SalesStaff: '/staff',
    BranchManager: '/manager',
    Admin: '/admin',
  }
  return roleRedirectMap[role] || '/dashboard'
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)

  // Lấy path mà user muốn vào trước khi bị redirect về /login
  // (ProtectedRoute lưu vào location.state.from)
  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname

  const login = useCallback(async (loginData: LoginRequest) => {
    // Reset lỗi cũ trước khi gọi API mới
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const { user, token } = await authService.login(loginData)

      // Lưu vào Zustand store (store sẽ persist vào localStorage)
      setAuth(user, token)

      const guestId = localStorage.getItem('guest_id')
      if (guestId) {
        interactionService.mergeGuestHistory(guestId).then(() => {
          localStorage.removeItem('guest_id')
        }).catch(() => {
          console.warn('[Tier3.1] Merge guest history thất bại, bỏ qua')
        })
      }

      // Redirect theo role, ưu tiên quay lại trang user muốn vào (nếu hợp lệ)
      const defaultPath = getRedirectPathByRole(user.role)
      const redirectTo = fromPath || defaultPath
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const apiError = err as ApiErrorResponse

      if (apiError.errorCode === 'VALIDATION_FAILED' && apiError.errors) {
        // Parse lỗi từng field để hiện ngay dưới input tương ứng
        const parsedFieldErrors: Record<string, string> = {}
        apiError.errors.forEach((validationError) => {
          parsedFieldErrors[validationError.field] = validationError.message
        })
        setFieldErrors(parsedFieldErrors)
      } else {
        // Lỗi chung (sai password, account bị khóa, network error, v.v.)
        setError(apiError.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
      }

      console.error('[useLogin] Login failed:', apiError)
    } finally {
      setIsLoading(false)
    }
  }, [setAuth, navigate, fromPath])

  const clearErrors = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  return { login, isLoading, error, fieldErrors, clearErrors }
}
