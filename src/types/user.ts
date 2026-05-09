/**
 * User Types — Types chung cho user dùng xuyên suốt app
 * 
 * Re-export UserRole từ auth.types.ts (source of truth từ backend)
 * và mở rộng thêm 'Guest' cho frontend-only state.
 * 
 * Giữ lại interface User cũ để backward compat với các module khác
 * (vehicles, booking, v.v.) đang import từ @/types.
 */

import type { UserRole as BackendUserRole } from './auth.types'

// Mở rộng UserRole backend thêm 'Guest' — chỉ dùng ở frontend (chưa đăng nhập)
export type UserRole = BackendUserRole | 'Guest'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  branchId?: string
  avatar?: string
}
