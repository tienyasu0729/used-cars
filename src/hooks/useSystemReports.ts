import { useQuery } from '@tanstack/react-query'
import type { AdminReport } from '@/types/admin.types'
import { asApiArray } from '@/utils/asApiArray'

export function useSystemReports() {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/reports')
        return asApiArray<AdminReport>(res.data)
      } catch {
        return [] as AdminReport[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
