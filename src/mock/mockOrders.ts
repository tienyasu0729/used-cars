import type { Order } from '@/types'

export const mockOrders: Order[] = [
  { id: 'ORD-001', vehicleId: 'v1', customerId: 'u1', price: 850000000, deposit: 100000000, status: 'Completed', createdAt: '2025-02-15T10:30:00Z' },
  { id: 'ORD-002', vehicleId: 'v2', customerId: 'u1', price: 720000000, deposit: 50000000, status: 'Processing', createdAt: '2025-03-01T14:20:00Z' },
  { id: 'ORD-003', vehicleId: 'v3', customerId: 'u1', price: 680000000, deposit: 50000000, status: 'Confirmed', createdAt: '2025-03-05T09:00:00Z' },
  { id: 'ORD-004', vehicleId: 'v4', customerId: 'u1', price: 620000000, deposit: 0, status: 'Cancelled', createdAt: '2025-02-20T14:00:00Z' },
]
