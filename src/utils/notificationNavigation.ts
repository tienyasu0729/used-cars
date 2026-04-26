/**
 * Chuẩn hóa link thông báo inbox cho khách (dashboard nằm dưới /dashboard/*).
 * Trả null khi chỉ nên xem chi tiết trong popup (không điều hướng).
 */
export function normalizeCustomerNotificationLink(link?: string | null): string | null {
  if (link == null || link === '' || link === '#') return null
  const L = link.trim()
  /** Tham chiếu phiếu tư vấn — mở modal, không route. */
  if (L.startsWith('consultation-ref:')) return null
  if (L === '/notifications' || L === '/dashboard/notifications') return null

  const shortcuts: Record<string, string> = {
    '/deposits': '/dashboard/deposits',
    '/orders': '/dashboard/orders',
    '/bookings': '/dashboard/bookings',
    '/transactions': '/dashboard/transactions',
    '/chat': '/dashboard/chat',
    '/profile': '/dashboard/profile',
    '/saved': '/dashboard/saved',
    '/security': '/dashboard/security',
  }
  if (shortcuts[L]) return shortcuts[L]
  if (L.startsWith('/dashboard/')) return L
  if (L.startsWith('/')) return L
  return null
}
