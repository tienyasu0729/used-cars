export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} VND`
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN')
}
