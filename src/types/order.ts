export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled'

export interface Order {
  id: string
  orderNumber?: string
  vehicleId: string
  customerId: string
  customerName?: string
  price: number
  deposit: number
  remaining?: number
  status: OrderStatus
  createdAt: string
  paymentMethod?: string
  notes?: string
  staffId?: string
  staffName?: string
  staffEmail?: string
  staffPhone?: string
  branchName?: string
  updatedAt?: string
}
