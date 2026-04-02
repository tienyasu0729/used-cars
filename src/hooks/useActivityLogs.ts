import { useQuery } from '@tanstack/react-query'
import type { AdminLog } from '@/types/admin.types'

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: T[] }).content
  }
  return []
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/logs')
        return asList<AdminLog>(res.data)
      } catch {
        return [] as AdminLog[]
      }
    },
    staleTime: 1000 * 60,
  })
}
