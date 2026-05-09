/**
 * Mask nhập ngày dd/mm/yyyy: chỉ giữ số, tối đa 8 chữ số, tự chèn dấu / sau ngày và tháng.
 */
export function formatDateInputDdMmYyyy(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}
