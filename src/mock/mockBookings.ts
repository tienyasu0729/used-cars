import type { Booking } from '@/types'

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    vehicleId: 'v1',
    customerId: 'u1',
    branchId: 'branch1',
    date: '2025-03-15',
    timeSlot: '09:30',
    status: 'Confirmed',
    note: 'Muốn lái thử trên đường cao tốc',
  },
  {
    id: 'b2',
    vehicleId: 'v2',
    customerId: 'u1',
    branchId: 'branch1',
    date: '2025-03-22',
    timeSlot: '14:00',
    status: 'Pending',
  },
  {
    id: 'b3',
    vehicleId: 'v4',
    customerId: 'u1',
    branchId: 'branch3',
    date: '2025-03-10',
    timeSlot: '10:00',
    status: 'Completed',
  },
]
