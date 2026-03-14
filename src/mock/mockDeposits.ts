import type { Deposit } from '@/types'

export const mockDeposits: Deposit[] = [
  {
    id: 'd1',
    vehicleId: 'v3',
    customerId: 'u1',
    amount: 80000000,
    depositDate: '2025-03-05',
    expiryDate: '2025-03-12',
    status: 'Confirmed',
  },
  {
    id: 'd2',
    vehicleId: 'v2',
    customerId: 'u1',
    amount: 50000000,
    depositDate: '2025-03-01',
    expiryDate: '2025-03-08',
    status: 'ConvertedToOrder',
    orderId: 'ORD-002',
  },
]
