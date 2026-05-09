import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

/** Danh sách tư vấn — dùng endpoint đúng /api/v1/consultations */
export function useConsultations() {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const res = (await axiosInstance.get('/consultations')) as unknown as ApiResponse<unknown[]>
      const raw = res.data
      return Array.isArray(raw) ? raw : []
    },
    staleTime: 1000 * 60,
  })
}
