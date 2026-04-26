/**
 * RegisterPage — Trang đăng ký /register
 * 
 * Page này chỉ import và render RegisterForm component.
 * Toàn bộ logic nằm trong RegisterForm → useRegister hook → authService.
 */

import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  return <RegisterForm />
}
