import { useQuery } from '@tanstack/react-query'
import { mockBookings } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchBookings() {
  if (isMockMode()) return mockBookings
  try {
    const res = await fetch('/api/bookings')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockBookings
    }
  } catch {}
  return mockBookings
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings', isMockMode()],
    queryFn: fetchBookings,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
