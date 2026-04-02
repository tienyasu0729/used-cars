/** Backend booking chưa trả customerName — hiển thị nhãn ổn định từ id. */
export function customerDisplayLabel(customerId: number | null | undefined): string {
  if (customerId == null || !Number.isFinite(customerId)) return 'Khách'
  return `Khách #${customerId}`
}
