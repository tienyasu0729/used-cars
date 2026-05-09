import { useQuery } from '@tanstack/react-query'
import type { AdminUser, AdminUserStatus } from '@/types/admin.types'

export type AdminUsersQueryFilters = {
  role?: string
  status?: string
  search?: string
}

function mapUser(o: Record<string, unknown>): AdminUser {
  const st = String(o.status ?? 'active').toLowerCase()
  const status: AdminUserStatus =
    st === 'locked' ? 'locked' : st === 'inactive' ? 'inactive' : 'active'
  const createdRaw = o.createdAt
  let createdAt = ''
  if (createdRaw != null) {
    const s = String(createdRaw)
    createdAt = s.length >= 10 ? s.slice(0, 10) : s
  }
  const bid = o.branchId
  return {
    id: String(o.id ?? ''),
    name: String(o.name ?? ''),
    email: String(o.email ?? ''),
    phone: String(o.phone ?? ''),
    role: String(o.role ?? ''),
    branchId: bid != null && bid !== '' ? String(bid) : undefined,
    branchName: o.branchName != null && String(o.branchName) !== '' ? String(o.branchName) : undefined,
    status,
    createdAt,
    avatarUrl: o.avatarUrl != null ? String(o.avatarUrl) : null,
  }
}

function normalizeFilters(f: AdminUsersQueryFilters | undefined) {
  const x = f ?? {}
  return {
    role: x.role?.trim() || undefined,
    status: x.status?.trim() || undefined,
    search: x.search?.trim() || undefined,
  }
}

/** Bộ lọc tùy chọn — gọi `useUsers()` không tham số = tải toàn bộ (dashboard, v.v.). */
export function useUsers(filters: AdminUsersQueryFilters = {}) {
  const n = normalizeFilters(filters)
  return useQuery({
    queryKey: ['admin-users', n.role ?? '', n.status ?? '', n.search ?? ''],
    queryFn: async () => {
      const { api } = await import('@/services/apiClient')
      const params: Record<string, string | number> = { page: 0, size: 50 }
      if (n.role) params.role = n.role
      if (n.status) params.status = n.status
      if (n.search) params.search = n.search

      const first = await api.get<unknown>('/admin/users', { params })
      const body = first.data as { data?: unknown[]; meta?: { total?: number } }
      let rows = Array.isArray(body.data) ? body.data : []
      const total = typeof body.meta?.total === 'number' ? body.meta.total : rows.length
      if (total > rows.length) {
        const second = await api.get<unknown>('/admin/users', { params: { ...params, page: 0, size: total } })
        const b2 = second.data as { data?: unknown[] }
        rows = Array.isArray(b2.data) ? b2.data : []
      }
      return rows.map((r) => mapUser(r as Record<string, unknown>))
    },
    staleTime: 1000 * 60,
  })
}
