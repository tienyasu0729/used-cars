import type { InternalAxiosRequestConfig } from 'axios'

/**
 * Modal chặn toàn màn hình (ACCOUNT_SUSPENDED) chỉ dùng khi user đã đăng nhập khu vực nội bộ
 * (nhân viên / quản lý / admin). Trang đăng nhập: chỉ hiện lỗi đỏ trên form, không mở modal.
 */
function isAuthCredentialRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  const u = config?.url?.split('?')[0] ?? ''
  const normalized = u.replace(/^\/+/, '')
  return (
    normalized === 'auth/login' ||
    normalized === 'auth/register' ||
    normalized.endsWith('/auth/login') ||
    normalized.endsWith('/auth/register')
  )
}

function isInternalPortalRoleInSession(): boolean {
  try {
    const raw = localStorage.getItem('auth_user')
    if (!raw) return false
    const user = JSON.parse(raw) as { role?: string }
    return (
      user.role === 'SalesStaff' ||
      user.role === 'BranchManager' ||
      user.role === 'Admin'
    )
  } catch {
    return false
  }
}

export function shouldOpenAccountSuspendedModal(config: InternalAxiosRequestConfig | undefined): boolean {
  if (isAuthCredentialRequest(config)) return false
  return isInternalPortalRoleInSession()
}
