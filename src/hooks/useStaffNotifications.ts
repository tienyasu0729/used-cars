import { useQuery } from '@tanstack/react-query'
import { isMockMode } from '@/config/dataSource'

import type { Notification } from '@/types'

const mockStaffNotifications: Notification[] = [
  {
    id: '1',
    title: 'Lịch hẹn mới',
    body: 'Khách hàng Nguyễn Văn A vừa đặt lịch xem xe lúc 14:00 hôm nay.',
    type: 'AppointmentTestDrive',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Thêm xe thành công',
    body: 'Xe VinFast VF8 đã được duyệt hiển thị.',
    type: 'System',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

export function useStaffNotifications() {
  return useQuery({
    queryKey: ['staff-notifications', isMockMode()],
    queryFn: async () => {
      // Backend not implemented for this endpoint yet, return mock to avoid errors
      return mockStaffNotifications
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}
