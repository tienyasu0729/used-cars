import { useQuery } from '@tanstack/react-query'
import type { AdminBranch } from '@/types/admin.types'
import { asApiArray } from '@/utils/asApiArray'

function mapBranch(raw: Record<string, unknown>): AdminBranch {
  const mgr =
    raw.managerName != null
      ? String(raw.managerName)
      : raw.manager != null
        ? String(raw.manager)
        : ''
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    managerName: mgr,
    address: String(raw.address ?? ''),
    phone: String(raw.phone ?? ''),
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    vehicleCount: Number(raw.vehicleCount ?? 0),
    staffCount: Number(raw.staffCount ?? 0),
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : undefined,
    workingHours: raw.workingHours != null ? String(raw.workingHours) : undefined,
    lat: Number(raw.lat ?? 0),
    lng: Number(raw.lng ?? 0),
  }
}

export function useBranchesAdmin() {
  return useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/branches')
        const rows = asApiArray<Record<string, unknown>>(res.data)
        return rows.map(mapBranch)
      } catch {
        return [] as AdminBranch[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
