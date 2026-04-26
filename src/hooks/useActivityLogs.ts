import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/apiClient'
import type { AdminLog } from '@/types/admin.types'

export type PageMeta = {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type AdminLogsQuery = {
  page: number
  size: number
  module?: string
  userId?: string
  fromDate?: string
  toDate?: string
  action?: string
}

export function useActivityLogs(q: AdminLogsQuery) {
  return useQuery({
    queryKey: ['admin-logs', q],
    queryFn: async () => {
      const res = await api.get<unknown>('/admin/logs', {
        params: {
          page: q.page,
          size: q.size,
          module: q.module || undefined,
          userId: q.userId || undefined,
          fromDate: q.fromDate || undefined,
          toDate: q.toDate || undefined,
          action: q.action || undefined,
        },
      })
      const body = res.data as {
        data?: AdminLog[]
        meta?: PageMeta
      }
      const items = Array.isArray(body?.data) ? body.data : []
      const meta = body?.meta
      return { items, meta }
    },
    staleTime: 30_000,
  })
}
