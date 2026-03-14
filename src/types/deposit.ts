export type DepositStatus = 'Pending' | 'Confirmed' | 'Refunded' | 'ConvertedToOrder'

export interface Deposit {
  id: string
  vehicleId: string
  customerId: string
  amount: number
  depositDate: string
  expiryDate: string
  status: DepositStatus
  orderId?: string
}
