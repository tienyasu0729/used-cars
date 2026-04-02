import { useQuery } from '@tanstack/react-query'
import type { AdminUser } from '@/types/admin.types'

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: T[] }).content
  }
  return []
}

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/users')
        return asList<AdminUser>(res.data)
      } catch {
        return [] as AdminUser[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
