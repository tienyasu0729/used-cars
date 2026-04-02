/** Lịch hẹn / booking hiển thị cho Manager — map từ API staff bookings. */
export interface ManagerAppointment {
  id: string
  customerName: string
  vehicleName: string
  staffName: string
  date: string
  timeSlot: string
  type: 'test_drive' | 'consultation'
  status: string
  phone?: string
  notes?: string
}
