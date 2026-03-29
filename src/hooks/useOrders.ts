import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { mockOrders } from '@/mock'
import { customerOrdersApiEnabled, isMockMode } from '@/config/dataSource'
import type { ApiResponse } from '@/types/auth.types'
import type { Order } from '@/types'

async function fetchOrders(): Promise<Order[]> {
  if (isMockMode() || !customerOrdersApiEnabled()) return mockOrders
  try {
    const res = (await axiosInstance.get('/orders')) as unknown as ApiResponse<Order[]>
    const raw = res.data
    if (Array.isArray(raw)) return raw
    return mockOrders
  } catch {
    return mockOrders
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders', isMockMode(), customerOrdersApiEnabled()],
    queryFn: fetchOrders,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id, isMockMode(), customerOrdersApiEnabled()],
    queryFn: async (): Promise<Order | null> => {
      if (!id) return null
      if (isMockMode()) {
        return mockOrders.find((o) => o.id === id) ?? null
      }
      if (!customerOrdersApiEnabled()) {
        return mockOrders.find((o) => o.id === id) ?? null
      }
      try {
        const res = (await axiosInstance.get(`/orders/${id}`)) as unknown as ApiResponse<Order>
        return res.data ?? mockOrders.find((o) => o.id === id) ?? null
      } catch {
        return mockOrders.find((o) => o.id === id) ?? null
      }
    },
    enabled: !!id,
  })
}
