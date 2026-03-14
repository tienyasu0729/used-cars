import { useQuery } from '@tanstack/react-query'
import { mockConsultations } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchConsultations() {
  if (isMockMode()) return mockConsultations
  try {
    const res = await fetch('/api/consultations')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockConsultations
    }
  } catch {}
  return mockConsultations
}

export function useConsultations() {
  return useQuery({
    queryKey: ['consultations', isMockMode()],
    queryFn: fetchConsultations,
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
