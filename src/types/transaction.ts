export type TransactionType = 'Deposit' | 'Purchase' | 'Refund'

export interface Transaction {
  id: string
  date: string
  description: string
  type: TransactionType
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
}
