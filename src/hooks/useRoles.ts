import { useQuery } from '@tanstack/react-query'
import type { AdminRole } from '@/types/admin.types'
import { asApiArray } from '@/utils/asApiArray'

function mapRole(raw: Record<string, unknown>): AdminRole {
  const perms = raw.permissions
  const permissionKeys = Array.isArray(perms) ? (perms as string[]).map(String) : []
  const idRaw = raw.permissionIds
  const permissionIds = Array.isArray(idRaw)
    ? (idRaw as unknown[]).map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0)
    : []
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    userCount: Number(raw.userCount ?? 0),
    permissionIds,
    permissionKeys,
    systemRole: Boolean(raw.systemRole),
  }
}

export function useRoles() {
  return useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/roles')
        const rows = asApiArray<Record<string, unknown>>(res.data)
        return rows.map(mapRole)
      } catch {
        return [] as AdminRole[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
