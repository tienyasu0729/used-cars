import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/services/orderApi'
import type { Order } from '@/types'

export function useOrders(params?: { status?: string; search?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['orders', params?.status, params?.search, params?.page, params?.size],
    queryFn: async () => {
      const { items, meta } = await orderApi.list({
        status: params?.status,
        search: params?.search,
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      })
      return { orders: items as Order[], meta }
    },
    staleTime: 1000 * 60,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<Order | null> => {
      if (!id || !/^\d+$/.test(id.trim())) return null
      return orderApi.getById(id)
    },
    enabled: !!id && /^\d+$/.test(id.trim()),
  })
}
