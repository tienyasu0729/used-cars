import { useOrders } from './useOrders'

export function useStaffOrders() {
  const { data, ...rest } = useOrders({ size: 200 })
  const orders = data?.orders
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const ordersToday =
    orders?.filter((o) => {
      const d = new Date(o.createdAt).toISOString().slice(0, 10)
      return d === today
    }) ?? []

  const ordersThisWeek = orders?.filter((o) => new Date(o.createdAt) >= weekAgo) ?? []

  return { data: orders, ordersToday, ordersThisWeek, meta: data?.meta, ...rest }
}
