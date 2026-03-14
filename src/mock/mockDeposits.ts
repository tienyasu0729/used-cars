import type { Deposit } from '@/types'

export const mockDeposits: Deposit[] = [
  { id: 'DEP-88291', vehicleId: 'v1', customerId: 'u1', amount: 10000000, depositDate: '2025-03-12', expiryDate: '2025-03-19', status: 'Confirmed' },
  { id: 'DEP-77412', vehicleId: 'v2', customerId: 'u1', amount: 20000000, depositDate: '2025-03-10', expiryDate: '2025-03-17', status: 'Pending' },
  { id: 'DEP-55104', vehicleId: 'v3', customerId: 'u1', amount: 5000000, depositDate: '2025-03-05', expiryDate: '2025-03-17', status: 'Confirmed' },
  { id: 'DEP-001', vehicleId: 'v2', customerId: 'u1', amount: 50000000, depositDate: '2025-02-01', expiryDate: '2025-02-08', status: 'ConvertedToOrder', orderId: 'ORD-002' },
]
