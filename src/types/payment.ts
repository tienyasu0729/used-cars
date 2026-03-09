export type PaymentStatus =
  | 'INIT'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'

export type PaymentMethod = 'vnpay' | 'momo' | 'zalopay'

export interface PaymentTransaction {
  transactionId?: string
  carId?: string
  amount?: number
  status: PaymentStatus
  method?: PaymentMethod
  paidAt?: string
}
