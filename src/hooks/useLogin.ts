/**
 * useLogin Hook — Xử lý toàn bộ logic đăng nhập (email/password + Google)
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
  /** Gọi hàm này khi nhận Google credential (ID Token) */
  googleLogin: (idToken: string) => Promise<void>
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
export function getRedirectPathByRole(role: UserProfile['role']): string {
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

  // Logic chung sau khi login thành công (dùng cho cả email/password và Google)
  const handleLoginSuccess = useCallback(async (user: UserProfile, token: string) => {
    setAuth(user, token)

    const permissions = await authService.fetchMyPermissions()
    useAuthStore.getState().setPermissions(permissions)

    const guestId = localStorage.getItem('guest_id')
    if (guestId) {
      interactionService.mergeGuestHistory(guestId).then(() => {
        localStorage.removeItem('guest_id')
      }).catch(() => {
        console.warn('[Tier3.1] Merge guest history thất bại, bỏ qua')
      })
    }

    if (user.passwordChangeRequired === true) {
      navigate('/login/set-new-password', { replace: true })
      return
    }

    const defaultPath = getRedirectPathByRole(user.role)
    const redirectTo = fromPath || defaultPath
    navigate(redirectTo, { replace: true })
  }, [setAuth, navigate, fromPath])

  // Xử lý lỗi chung cho cả 2 flow login
  const handleLoginError = useCallback((err: unknown) => {
    const apiError = err as ApiErrorResponse

    if (apiError.errorCode === 'VALIDATION_FAILED' && apiError.errors) {
      const parsedFieldErrors: Record<string, string> = {}
      apiError.errors.forEach((validationError) => {
        parsedFieldErrors[validationError.field] = validationError.message
      })
      setFieldErrors(parsedFieldErrors)
    } else {
      setError(apiError.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    }

    console.error('[useLogin] Login failed:', apiError)
  }, [])

  const login = useCallback(async (loginData: LoginRequest) => {
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const { user, token } = await authService.login(loginData)
      await handleLoginSuccess(user, token)
    } catch (err) {
      handleLoginError(err)
    } finally {
      setIsLoading(false)
    }
  }, [handleLoginSuccess, handleLoginError])

  // Đăng nhập bằng Google — nhận ID Token từ Google Sign-In popup
  const googleLogin = useCallback(async (idToken: string) => {
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const { user, token } = await authService.googleLogin(idToken)
      await handleLoginSuccess(user, token)
    } catch (err) {
      handleLoginError(err)
    } finally {
      setIsLoading(false)
    }
  }, [handleLoginSuccess, handleLoginError])

  const clearErrors = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  return { login, googleLogin, isLoading, error, fieldErrors, clearErrors }
}
