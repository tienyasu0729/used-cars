export type VehicleStatus = 'Available' | 'Reserved' | 'Sold'
export type FuelType = 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric'
export type Transmission = 'Automatic' | 'Manual'

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: FuelType
  transmission: Transmission
  status: VehicleStatus
  branchId: string
  images: string[]
  trim?: string
  exteriorColor?: string
  interiorColor?: string
  plateNumber?: string
  description?: string
}
