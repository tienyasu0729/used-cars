import type { Transaction } from '@/types'

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    date: '2025-03-05',
    description: 'Đặt cọc xe Ford Ranger',
    type: 'Deposit',
    amount: -80000000,
    status: 'Completed',
  },
  {
    id: 'tx2',
    date: '2025-02-15',
    description: 'Thanh toán mua xe Toyota Camry',
    type: 'Purchase',
    amount: -750000000,
    status: 'Completed',
  },
  {
    id: 'tx3',
    date: '2025-02-10',
    description: 'Tiền cọc Toyota Camry',
    type: 'Deposit',
    amount: -100000000,
    status: 'Completed',
  },
]
