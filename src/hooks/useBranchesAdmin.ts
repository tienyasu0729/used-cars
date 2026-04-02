import { useQuery } from '@tanstack/react-query'
import type { AdminBranch } from '@/types/admin.types'

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: T[] }).content
  }
  return []
}

export function useBranchesAdmin() {
  return useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/branches')
        return asList<AdminBranch>(res.data)
      } catch {
        return [] as AdminBranch[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
