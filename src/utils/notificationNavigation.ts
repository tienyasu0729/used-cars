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

/**
 * Chuẩn hóa link thông báo inbox cho staff.
 * Trường hợp thiếu link từ backend sẽ fallback theo nội dung title/body.
 */
export function normalizeStaffNotificationLink(params: {
  link?: string | null
  title?: string | null
  body?: string | null
}): string | null {
  const raw = params.link?.trim()
  if (raw != null && raw !== '' && raw !== '#') {
    if (raw === '/notifications' || raw === '/staff/notifications') return null
    if (raw === '/installments') return '/staff/installments'
    if (raw.startsWith('/staff/')) return raw
    if (raw.startsWith('/')) return raw
  }

  const title = (params.title ?? '').toLowerCase()
  const body = (params.body ?? '').toLowerCase()
  const combined = `${title} ${body}`

  if (
    combined.includes('trả góp') ||
    combined.includes('tra gop') ||
    combined.includes('hồ sơ vay') ||
    combined.includes('ho so vay') ||
    combined.includes('thẩm định') ||
    combined.includes('tham dinh')
  ) {
    return '/staff/installments'
  }

  return null
}
