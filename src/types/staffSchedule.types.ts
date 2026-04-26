/** Lịch nhân viên — map từ booking API. */
export interface StaffScheduleItem {
  id: string
  bookingId?: string
  customerId: string
  customerName: string
  customerPhone?: string
  vehicleId?: string
  vehicleName: string
  branchId?: string
  location?: string
  date: string
  timeSlot: string
  endTime?: string
  type: 'test_drive' | 'consultation' | 'handover' | 'contract' | 'meeting'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}
