import type { Notification } from '@/types'

export const mockStaffNotifications: Notification[] = [
  {
    id: 's1',
    type: 'AppointmentTestDrive',
    title: 'Lịch lái thử mới',
    body: 'Khách Nguyễn Văn A đặt lịch lái thử Toyota Camry ngày 16/03/2025 lúc 14:00.',
    read: false,
    createdAt: '2025-03-14T08:30:00Z',
    link: '/staff/bookings',
  },
  {
    id: 's2',
    type: 'AppointmentConsultation',
    title: 'Yêu cầu tư vấn mới',
    body: 'Khách Trần Thị B yêu cầu tư vấn Ford Everest. Cần phản hồi.',
    read: false,
    createdAt: '2025-03-13T15:20:00Z',
    link: '/staff/consultations',
  },
  {
    id: 's3',
    type: 'TransferIncoming',
    title: 'Yêu cầu điều chuyển',
    body: 'Chi nhánh Hà Nội yêu cầu điều chuyển Mazda CX-5 đến. Cần xử lý.',
    read: false,
    createdAt: '2025-03-14T07:00:00Z',
    link: '/staff/transfer-requests',
  },
  {
    id: 's4',
    type: 'Deposit',
    title: 'Đặt cọc mới',
    body: 'Khách Lê Văn C đặt cọc 50.000.000₫ cho Honda Civic. Xác nhận đơn.',
    read: true,
    createdAt: '2025-03-12T11:00:00Z',
    link: '/staff/orders',
  },
]
