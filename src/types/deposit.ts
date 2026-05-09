export type DepositStatus =
  | 'AwaitingPayment'
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
  customerName?: string
  vehicleTitle?: string
  vehicleImageUrl?: string | null
  amount: number
  depositDate: string
  expiryDate: string
  createdAt?: string | null
  status: DepositStatus
  orderId?: string
  /** Cột gateway_txn_ref — trùng với admin / cổng thanh toán */
  gatewayTxnRef?: string | null
}
