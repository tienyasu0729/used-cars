/** Khớp role Customer từ API / JWT (Customer, CUSTOMER, customer, …). */
export function isCustomerRole(role: string | undefined | null): boolean {
  if (role == null || role === '') return false
  return String(role).trim().toLowerCase() === 'customer'
}
