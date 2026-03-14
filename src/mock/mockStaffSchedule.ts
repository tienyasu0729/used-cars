export interface StaffScheduleItem {
  id: string
  bookingId: string
  customerId: string
  customerName: string
  vehicleId: string
  vehicleName: string
  branchId: string
  date: string
  timeSlot: string
  type: 'test_drive' | 'consultation' | 'handover'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export const mockStaffSchedule: StaffScheduleItem[] = [
  {
    id: 's1',
    bookingId: 'b4',
    customerId: 'u1',
    customerName: 'Nguyễn Minh Hùng',
    vehicleId: 'v1',
    vehicleName: 'Toyota Camry 2.5Q 2023',
    branchId: 'branch1',
    date: '2025-03-14',
    timeSlot: '09:00',
    type: 'test_drive',
    status: 'confirmed',
  },
  {
    id: 's2',
    bookingId: 'b5',
    customerId: 'u1',
    customerName: 'Chị Phạm Thanh Lan',
    vehicleId: 'v2',
    vehicleName: 'Hyundai Tucson L',
    branchId: 'branch1',
    date: '2025-03-14',
    timeSlot: '14:30',
    type: 'handover',
    status: 'pending',
  },
  {
    id: 's3',
    bookingId: 'b6',
    customerId: 'u1',
    customerName: 'Anh Trần Hoàng Nam',
    vehicleId: 'v3',
    vehicleName: 'Mazda CX-5',
    branchId: 'branch1',
    date: '2025-03-14',
    timeSlot: '16:00',
    type: 'consultation',
    status: 'pending',
  },
]
