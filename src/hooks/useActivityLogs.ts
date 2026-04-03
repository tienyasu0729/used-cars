import { useQuery } from '@tanstack/react-query'
import type { AdminLog } from '@/types/admin.types'
import { asApiArray } from '@/utils/asApiArray'

export function useActivityLogs() {
  return useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/logs')
        return asApiArray<AdminLog>(res.data)
      } catch {
        return [] as AdminLog[]
      }
    },
    staleTime: 1000 * 60,
  })
}
