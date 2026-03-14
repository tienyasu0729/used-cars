import type { Booking } from '@/types'

export const mockBookings: Booking[] = [
  { id: 'b1', vehicleId: 'v1', customerId: 'u1', branchId: 'branch1', date: '2025-03-15', timeSlot: '09:30', status: 'Confirmed', note: 'Muốn lái thử trên đường cao tốc' },
  { id: 'b2', vehicleId: 'v2', customerId: 'u5', branchId: 'branch1', date: '2025-03-16', timeSlot: '15:30', status: 'Confirmed' },
  { id: 'b3', vehicleId: 'v4', customerId: 'u1', branchId: 'branch1', date: '2025-03-10', timeSlot: '10:00', status: 'Completed' },
  { id: 'b4', vehicleId: 'v1', customerId: 'u1', branchId: 'branch1', date: '2025-03-14', timeSlot: '09:00', status: 'Confirmed' },
  { id: 'b5', vehicleId: 'v2', customerId: 'u1', branchId: 'branch1', date: '2025-03-22', timeSlot: '14:00', status: 'Pending' },
  { id: 'b6', vehicleId: 'v3', customerId: 'u6', branchId: 'branch1', date: '2025-03-17', timeSlot: '08:00', status: 'Cancelled' },
  { id: 'b7', vehicleId: 'v3', customerId: 'u7', branchId: 'branch1', date: '2025-03-18', timeSlot: '14:00', status: 'Pending' },
  { id: 'b8', vehicleId: 'v4', customerId: 'u5', branchId: 'branch1', date: '2025-03-15', timeSlot: '11:00', status: 'Confirmed' },
  { id: 'b9', vehicleId: 'v1', customerId: 'u6', branchId: 'branch1', date: '2025-03-15', timeSlot: '16:00', status: 'Pending' },
  { id: 'b10', vehicleId: 'v2', customerId: 'u7', branchId: 'branch1', date: '2025-03-15', timeSlot: '10:00', status: 'Confirmed' },
]
