/** Lịch hẹn / booking hiển thị cho Manager — map từ API staff bookings. */
export interface ManagerAppointment {
  id: string
  customerId?: number
  customerName: string
  vehicleName: string
  staffId?: number | null
  staffName: string
  date: string
  timeSlot: string
  type: 'test_drive' | 'consultation'
  status: string
  phone?: string
  notes?: string
  branchName?: string
  createdAt?: string
}
