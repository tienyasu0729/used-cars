export interface StaffScheduleItem {
  id: string
  bookingId?: string
  customerId: string
  customerName: string
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

function getWeekDates() {
  const d = new Date()
  const day = d.getDay()
  const monOffset = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + monOffset)
  return Array.from({ length: 6 }, (_, i) => {
    const x = new Date(mon)
    x.setDate(mon.getDate() + i)
    return x.toISOString().slice(0, 10)
  })
}

function buildMockSchedule(): StaffScheduleItem[] {
  const [mon, tue, wed, thu, fri, sat] = getWeekDates()
  return [
    { id: 's1', bookingId: 'b4', customerId: 'u1', customerName: 'Anh Minh', vehicleId: 'v1', vehicleName: 'Mazda 3', branchId: 'branch1', location: 'Showroom Đà Nẵng', date: sat, timeSlot: '09:00', endTime: '10:00', type: 'consultation', status: 'confirmed' },
    { id: 's2', bookingId: 'b5', customerId: 'u1', customerName: 'Chị Lan', vehicleId: 'v2', vehicleName: 'Mazda CX-5', branchId: 'branch1', location: 'Showroom Đà Nẵng', date: sat, timeSlot: '10:00', endTime: '11:30', type: 'test_drive', status: 'confirmed' },
    { id: 's3', bookingId: 'b6', customerId: 'u1', customerName: 'Anh Trung', vehicleId: 'v3', vehicleName: 'Mazda Sante Fe', branchId: 'branch1', location: 'Văn phòng', date: wed, timeSlot: '10:00', endTime: '11:00', type: 'contract', status: 'pending' },
    { id: 's4', customerId: 'u1', customerName: 'Anh Hài', vehicleName: 'Ford Everest', branchId: 'branch1', location: 'Showroom Đà Nẵng', date: thu, timeSlot: '14:00', endTime: '15:00', type: 'test_drive', status: 'pending' },
    { id: 's5', customerId: 'staff', customerName: 'Review doanh số tuần', vehicleName: '', branchId: 'branch1', location: 'Phòng họp 2', date: sat, timeSlot: '17:30', endTime: '18:00', type: 'meeting', status: 'confirmed' },
    { id: 's6', customerId: 'u1', customerName: 'Anh Hoàng', vehicleId: 'v4', vehicleName: 'Hyundai Tucson', branchId: 'branch1', location: 'Cafe HighLands', date: sat, timeSlot: '15:00', endTime: '16:00', type: 'consultation', status: 'pending' },
  ]
}

export const mockStaffSchedule: StaffScheduleItem[] = buildMockSchedule()
