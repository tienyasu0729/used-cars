export type DepositStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Refunded'
  | 'ConvertedToOrder'
  | 'RefundPending'
  | 'RefundFailed'
  | 'Cancelled'
  | 'Expired'

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
