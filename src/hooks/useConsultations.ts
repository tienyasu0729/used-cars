import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

/** Danh sách tư vấn — khi backend có GET, map response tại đây. */
export function useConsultations() {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      try {
        const res = (await axiosInstance.get('/staff/consultations')) as unknown as ApiResponse<unknown[]>
        const raw = res.data
        return Array.isArray(raw) ? raw : []
      } catch {
        return [] as unknown[]
      }
    },
    staleTime: 1000 * 60,
  })
}
