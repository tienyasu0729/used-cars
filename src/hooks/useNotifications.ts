import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { customerExtrasApiEnabled } from '@/config/dataSource'
import type { ApiResponse } from '@/types/auth.types'
import type { Notification } from '@/types'

async function fetchNotifications(): Promise<Notification[]> {
  if (!customerExtrasApiEnabled()) return []
  try {
    const res = (await axiosInstance.get('/notifications')) as unknown as ApiResponse<Notification[]>
    const raw = res.data
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', customerExtrasApiEnabled()],
    queryFn: fetchNotifications,
    staleTime: 1000 * 60,
  })
}
