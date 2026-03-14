import { useQuery } from '@tanstack/react-query'
import { mockOrders } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchOrders() {
  if (isMockMode()) return mockOrders
  try {
    const res = await fetch('/api/orders')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockOrders
    }
  } catch {}
  return mockOrders
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders', isMockMode()],
    queryFn: fetchOrders,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id, isMockMode()],
    queryFn: async () => {
      if (!id) return null
      if (isMockMode()) {
        return mockOrders.find((o) => o.id === id) ?? null
      }
      try {
        const res = await fetch(`/api/orders/${id}`)
        return res.ok ? res.json() : null
      } catch {
        return mockOrders.find((o) => o.id === id) ?? null
      }
    },
    enabled: !!id,
  })
}
