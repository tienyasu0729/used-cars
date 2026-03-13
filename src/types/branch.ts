export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  district?: string
  lat: number
  lng: number
  openTime: string
  closeTime: string
  workingDays: string
  vehicleCount?: number
  staffCount?: number
  images?: string[]
  description?: string
}
