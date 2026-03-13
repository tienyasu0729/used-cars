import { useQuery } from '@tanstack/react-query'
import { mockVehicles } from '@/mock'
import { vehicleApi } from '@/services/vehicleApi'
import { isMockMode } from '@/config/dataSource'

export interface VehiclesResponse {
  data: typeof mockVehicles
  total: number
}

async function fetchVehicles(): Promise<VehiclesResponse> {
  if (isMockMode()) {
    return { data: mockVehicles, total: mockVehicles.length }
  }
  try {
    const res = await vehicleApi.getVehicles()
    const raw = res.data
    if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
      return raw as VehiclesResponse
    }
    if (Array.isArray(raw)) {
      return { data: raw, total: raw.length }
    }
    return { data: mockVehicles, total: mockVehicles.length }
  } catch {
    return { data: mockVehicles, total: mockVehicles.length }
  }
}

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles', isMockMode()],
    queryFn: fetchVehicles,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', id, isMockMode()],
    queryFn: async () => {
      if (!id) return null
      if (isMockMode()) {
        return mockVehicles.find((v) => v.id === id) ?? null
      }
      try {
        const res = await vehicleApi.getVehicleById(id)
        return res.data
      } catch {
        return mockVehicles.find((v) => v.id === id) ?? null
      }
    },
    enabled: !!id,
  })
}
