export interface Car {
  id: string
  name: string
  model: string
  brand?: string
  location?: string
  year: number
  price: number
  odo: number
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic'
  color: string
  images: string[]
  showroomId: string
  status: 'available' | 'viewing' | 'deposit' | 'sold' | 'sold_offline'
  views?: number
  vin?: string
  condition?: 'excellent' | 'good' | 'fair'
}
