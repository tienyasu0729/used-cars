import type { Vehicle } from '@/types'
import { api } from './apiClient'

export interface VehicleListParams {
  page?: number
  limit?: number
  brand?: string
  minPrice?: number
  maxPrice?: number
  maxYear?: number
  minYear?: number
}

export const vehicleApi = {
  getVehicles: (params?: VehicleListParams) =>
    api.get<{ data: Vehicle[]; total: number }>('/vehicles', { params }),
  getVehicleById: (id: string) => api.get<Vehicle>(`/vehicles/${id}`),
  createVehicle: (data: Partial<Vehicle>) => api.post<Vehicle>('/vehicles', data),
  updateVehicle: (id: string, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`/vehicles/${id}`),
}
