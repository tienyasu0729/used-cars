export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled'

export interface Order {
  id: string
  vehicleId: string
  customerId: string
  price: number
  deposit: number
  status: OrderStatus
  createdAt: string
}
