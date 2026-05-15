export function maskPhone(phone: string): string {
  const len = phone.length
  if (len <= 4) return phone
  if (len === 10) {
    return phone.slice(0, 2) + '*'.repeat(5) + phone.slice(7)
  }
  return phone.slice(0, 2) + '*'.repeat(len - 4) + phone.slice(len - 2)
}
