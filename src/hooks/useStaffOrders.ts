import { useOrders } from './useOrders'
import { useAuthStore } from '@/store/authStore'

export function useStaffOrders() {
  const { data, ...rest } = useOrders()
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const ordersToday = data?.filter((o) => {
    const d = new Date(o.createdAt).toISOString().slice(0, 10)
    return d === today
  }) ?? []

  const ordersThisWeek = data?.filter((o) => new Date(o.createdAt) >= weekAgo) ?? []

  return { data, ordersToday, ordersThisWeek, ...rest }
}
