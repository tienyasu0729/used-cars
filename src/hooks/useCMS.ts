import { useQuery } from '@tanstack/react-query'
import type { AdminCMSBanner, AdminCMSArticle } from '@/types/admin.types'

type CMSPayload = { banners: AdminCMSBanner[]; articles: AdminCMSArticle[] }

const emptyCms: CMSPayload = { banners: [], articles: [] }

export function useCMS() {
  return useQuery({
    queryKey: ['admin-cms'],
    queryFn: async () => {
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get<unknown>('/admin/cms')
        const raw = res.data
        const d =
          raw && typeof raw === 'object' && 'data' in raw && (raw as { data?: unknown }).data
            ? (raw as { data: unknown }).data
            : raw
        if (d && typeof d === 'object' && 'banners' in d && 'articles' in d) {
          const o = d as { banners?: unknown; articles?: unknown }
          return {
            banners: Array.isArray(o.banners) ? (o.banners as AdminCMSBanner[]) : [],
            articles: Array.isArray(o.articles) ? (o.articles as AdminCMSArticle[]) : [],
          }
        }
        return emptyCms
      } catch {
        return emptyCms
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
