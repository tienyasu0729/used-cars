import { useQuery } from '@tanstack/react-query'
import { mockCMSBanners, mockCMSArticles } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export function useCMS() {
  return useQuery({
    queryKey: ['admin-cms', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return { banners: mockCMSBanners, articles: mockCMSArticles }
      try {
        const { api } = await import('@/services/apiClient')
        const res = await api.get('/admin/cms')
        return res.data ?? { banners: mockCMSBanners, articles: mockCMSArticles }
      } catch {
        return { banners: mockCMSBanners, articles: mockCMSArticles }
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
