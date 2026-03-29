import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { mockNotifications } from '@/mock'
import { customerExtrasApiEnabled, isMockMode } from '@/config/dataSource'
import type { ApiResponse } from '@/types/auth.types'
import type { Notification } from '@/types'

async function fetchNotifications(): Promise<Notification[]> {
  if (isMockMode() || !customerExtrasApiEnabled()) return mockNotifications
  try {
    const res = (await axiosInstance.get('/notifications')) as unknown as ApiResponse<Notification[]>
    const raw = res.data
    if (Array.isArray(raw)) return raw
    return mockNotifications
  } catch {
    return mockNotifications
  }
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', isMockMode(), customerExtrasApiEnabled()],
    queryFn: fetchNotifications,
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
