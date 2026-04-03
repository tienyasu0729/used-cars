/**
 * LoginPage — Trang đăng nhập /login
 * 
 * Page này chỉ import và render LoginForm component.
 * Toàn bộ logic nằm trong LoginForm → useLogin hook → authService.
 * 
 * Tại sao tách Page và Form:
 * - Page lo layout (AuthLayout wrapper), SEO title
 * - Form lo render form + xử lý input
 * - Hook lo business logic + API
 * Dễ maintain và test từng layer riêng.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  // Nếu đã login rồi thì redirect luôn, không cần hiện form
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.passwordChangeRequired === true) {
        navigate('/login/set-new-password', { replace: true })
        return
      }
      const redirectMap: Record<string, string> = {
        Customer: '/dashboard',
        SalesStaff: '/staff',
        BranchManager: '/manager',
        Admin: '/admin',
      }
      navigate(redirectMap[user.role] || '/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  return <LoginForm />
}
