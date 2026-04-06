export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' VNĐ'
}

export function formatPriceNumber(price: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price)
}

export function formatMileage(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return '—'
  return new Intl.NumberFormat('vi-VN').format(km) + ' km'
}

export function formatMileageShort(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return '—'
  return (km >= 1000 ? `${Math.round(km / 1000)}k` : km) + ' km'
}

const VN_TZ = 'Asia/Ho_Chi_Minh'

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateVNCalendar(dateStr: string): string {
  const s = dateStr?.trim()
  if (!s) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (m) {
    const y = Number(m[1])
    const mo = Number(m[2])
    const day = Number(m[3])
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: VN_TZ,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(Date.UTC(y, mo - 1, day)))
  }
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTimeVN(isoStr: string | null | undefined): string {
  const s = isoStr?.trim()
  if (!s) return '—'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function formatLogInstant(raw: string | null | undefined): string {
  const s = raw?.trim()
  if (!s) return '—'
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('vi-VN')
}

/** Thời gian hiển thị cạnh tên trong danh sách chat (widget / sidebar). */
export function formatChatSidebarTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''
  const now = new Date()
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dayDiff = Math.floor((startOf(now) - startOf(then)) / 86400000)
  if (dayDiff === 0) {
    return then.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  if (dayDiff >= 1 && dayDiff < 7) {
    return then.toLocaleDateString('vi-VN', { weekday: 'short' })
  }
  return then.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
