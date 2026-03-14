import type { Notification } from '@/types'

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'Booking',
    title: 'Lịch lái thử đã xác nhận',
    body: 'Lịch lái thử Honda Civic ngày 15/03/2025 lúc 09:30 đã được xác nhận.',
    read: false,
    createdAt: '2025-03-12T08:00:00Z',
    link: '/dashboard/bookings',
  },
  {
    id: 'n2',
    type: 'Deposit',
    title: 'Đặt cọc thành công',
    body: 'Bạn đã đặt cọc 80.000.000₫ cho xe Ford Ranger. Xe được giữ đến 12/03/2025.',
    read: true,
    createdAt: '2025-03-05T14:30:00Z',
    link: '/dashboard/deposits',
  },
  {
    id: 'n3',
    type: 'PriceDrop',
    title: 'Xe yêu thích giảm giá',
    body: 'Mazda CX-5 đã giảm 15 triệu. Giá mới: 530.000.000₫.',
    read: false,
    createdAt: '2025-03-10T09:15:00Z',
    link: '/vehicles/v4',
  },
]
