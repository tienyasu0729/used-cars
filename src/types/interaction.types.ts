import type { VehicleStatus } from '@/types/vehicle.types'

export interface SavedVehicleItem {
  vehicleId: number
  listingId: string
  title: string
  price: number
  status: VehicleStatus
  primaryImageUrl: string | null
  savedAt: string
}

export interface ViewedVehicleItem {
  vehicleId: number
  listingId: string
  title: string
  price: number
  primaryImageUrl: string | null
}
