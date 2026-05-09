import { useQuery } from '@tanstack/react-query'
import { paymentApi } from '@/services/paymentApi'

export function usePaymentDepositMethods(enabled = true) {
  return useQuery({
    queryKey: ['payment-deposit-methods'],
    queryFn: () => paymentApi.getDepositMethods(),
    enabled,
    staleTime: 60_000,
  })
}
