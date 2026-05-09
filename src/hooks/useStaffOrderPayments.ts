import { useQuery } from '@tanstack/react-query'
import { paymentApi } from '@/services/paymentApi'

export function useStaffOrderPayments(orderId: number | null) {
  return useQuery({
    queryKey: ['staff-order-payments', orderId],
    queryFn: () => paymentApi.listOrderPayments(orderId!),
    enabled: orderId != null,
  })
}
