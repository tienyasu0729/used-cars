export type TransactionStatus = 'Completed' | 'Pending' | 'Refunded'

export interface Transaction {
  id: string
  date: string
  customerName: string
  showroom: string
  car: string
  amount: number
  currency: string
  status: TransactionStatus
}
