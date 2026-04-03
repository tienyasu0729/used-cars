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

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
