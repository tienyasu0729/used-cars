import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type { Order } from '@/types'

async function fetchOrders(): Promise<Order[]> {
  try {
    const res = (await axiosInstance.get('/orders')) as unknown as ApiResponse<Order[]>
    const raw = res.data
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 2,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<Order | null> => {
      if (!id) return null
      try {
        const res = (await axiosInstance.get(`/orders/${id}`)) as unknown as ApiResponse<Order>
        return res.data ?? null
      } catch {
        return null
      }
    },
    enabled: !!id,
  })
}
