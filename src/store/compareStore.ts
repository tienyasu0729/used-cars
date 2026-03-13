import { create } from 'zustand'
import type { Vehicle } from '@/types'

interface CompareState {
  vehicles: Vehicle[]
  addVehicle: (vehicle: Vehicle) => void
  removeVehicle: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>((set) => ({
  vehicles: [],
  addVehicle: (vehicle) =>
    set((state) => {
      if (state.vehicles.length >= 3) return state
      if (state.vehicles.some((v) => v.id === vehicle.id)) return state
      return { vehicles: [...state.vehicles, vehicle] }
    }),
  removeVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    })),
  clear: () => set({ vehicles: [] }),
}))
