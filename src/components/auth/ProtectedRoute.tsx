/**
 * ProtectedRoute — Component wrapper bảo vệ route cần đăng nhập
 * 
 * Logic 3 bước:
 * 1. Chưa đăng nhập → redirect /login (lưu lại path hiện tại vào state)
 * 2. Đã đăng nhập nhưng role không được phép → hiện trang 403
 * 3. OK (đã login + role hợp lệ) → render children
 * 
 * Tại sao dùng cả tên viết thường lẫn PascalCase trong roles check:
 * Router cũ truyền roles kiểu ['staff', 'SalesStaff'] (backward compat).
 * Code mới map chuẩn về PascalCase trước khi so sánh.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/auth.types'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Danh sách role được phép truy cập route này */
  allowedRoles?: string[]
  /** Alias cũ để backward compat với router hiện tại */
  roles?: string[]
}

/**
 * Map tên role viết thường (dùng trong router cũ) → PascalCase chuẩn.
 * Nếu role đã là PascalCase thì giữ nguyên.
 */
const ROLE_ALIAS_MAP: Record<string, UserRole> = {
  customer: 'Customer',
  staff: 'SalesStaff',
  salesstaff: 'SalesStaff',
  manager: 'BranchManager',
  branchmanager: 'BranchManager',
  admin: 'Admin',
}

function normalizeRole(role: string): string {
  return ROLE_ALIAS_MAP[role.toLowerCase()] || role
}

export function ProtectedRoute({ children, allowedRoles, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // Gộp allowedRoles và roles (backward compat) thành 1 danh sách
  const effectiveRoles = allowedRoles || roles

  // Bước 1: Chưa đăng nhập → redirect về /login
  // Lưu path hiện tại vào state.from để sau login redirect lại
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Bước 2: Đã login nhưng role không nằm trong danh sách cho phép → 403
  if (effectiveRoles && effectiveRoles.length > 0) {
    const normalizedAllowed = effectiveRoles.map(normalizeRole)
    const userRoleNormalized = normalizeRole(user.role)

    if (!normalizedAllowed.includes(userRoleNormalized)) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <ShieldX className="text-red-400" size={80} />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">403 — Không có quyền truy cập</h1>
          <p className="mt-3 text-gray-500">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </p>
          <a
            href="/"
            className="mt-6 rounded-lg bg-[#1A3C6E] px-6 py-2 text-white hover:bg-[#1A3C6E]/90 transition-colors"
          >
            Về trang chủ
          </a>
        </div>
      )
    }
  }

  // Bước 3: Mọi thứ OK → render children
  return <>{children}</>
}
