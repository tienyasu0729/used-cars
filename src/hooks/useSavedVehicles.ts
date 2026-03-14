import { useQuery } from '@tanstack/react-query'
import { mockVehicles } from '@/mock'
import { isMockMode } from '@/config/dataSource'

const SAVED_IDS_KEY = 'saved_vehicle_ids'

function getSavedIds(): string[] {
  try {
    const s = localStorage.getItem(SAVED_IDS_KEY)
    return s ? JSON.parse(s) : []
  } catch {
    return ['v1', 'v2', 'v4']
  }
}

async function fetchSavedVehicles() {
  const ids = getSavedIds()
  if (isMockMode()) {
    return mockVehicles.filter((v) => ids.includes(v.id))
  }
  try {
    const res = await fetch('/api/users/me/saved-vehicles')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? []
    }
  } catch {}
  return mockVehicles.filter((v) => ids.includes(v.id))
}

export function useSavedVehicles() {
  return useQuery({
    queryKey: ['savedVehicles', isMockMode()],
    queryFn: fetchSavedVehicles,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 2,
  })
}
