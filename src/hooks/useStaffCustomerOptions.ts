import { useQuery } from '@tanstack/react-query'
import { fetchStaffCustomerOptions } from '@/services/staffLookup.service'

export function useStaffCustomerOptions(enabled = true) {
  return useQuery({
    queryKey: ['staff-customer-options'],
    queryFn: fetchStaffCustomerOptions,
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}
