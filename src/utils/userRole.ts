function normalizeRole(role: string | undefined | null): string {
  if (role == null || role === '') return ''
  return String(role).trim().toLowerCase()
}

/** Khớp role Customer từ API / JWT (Customer, CUSTOMER, customer, …). */
export function isCustomerRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === 'customer'
}

/** Admin luôn match không phân biệt hoa thường. */
export function isAdminRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === 'admin'
}

/** Nhóm staff nội bộ có thể dùng managed routes. */
export function canUseManagedVehicleView(role: string | undefined | null): boolean {
  const normalized = normalizeRole(role)
  return normalized === 'admin' || normalized === 'branchmanager' || normalized === 'salesstaff'
}
