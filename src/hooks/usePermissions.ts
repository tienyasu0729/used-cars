/**
 * usePermissions / useHasPermission — Hook kiểm tra quyền user
 *
 * Admin luôn có toàn bộ quyền (return true).
 * Các role khác kiểm tra theo danh sách permission lưu trong authStore.
 */

import { useAuthStore } from '@/store/authStore'

/**
 * Kiểm tra user hiện tại có quyền cụ thể không.
 * VD: useHasPermission('Vehicles', 'create') → true/false
 */
export function useHasPermission(module: string, action: string): boolean {
  const permissions = useAuthStore((s) => s.permissions)
  const user = useAuthStore((s) => s.user)

  // Admin luôn có toàn bộ quyền
  if (user?.role === 'Admin') return true

  return permissions.includes(`${module}.${action}`)
}

/**
 * Lấy toàn bộ danh sách permission của user hiện tại.
 * VD: ["Vehicles.view", "Vehicles.create", "Orders.view"]
 */
export function usePermissions(): string[] {
  return useAuthStore((s) => s.permissions)
}
