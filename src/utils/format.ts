export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' ₫'
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('vi-VN').format(km) + ' km'
}
