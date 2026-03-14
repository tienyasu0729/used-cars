import type { Order } from '@/types'

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    vehicleId: 'v1',
    customerId: 'u1',
    price: 850000000,
    deposit: 100000000,
    status: 'Completed',
    createdAt: '2025-02-15T10:30:00Z',
  },
  {
    id: 'ORD-002',
    vehicleId: 'v2',
    customerId: 'u1',
    price: 720000000,
    deposit: 50000000,
    status: 'Processing',
    createdAt: '2025-03-01T14:20:00Z',
  },
]
